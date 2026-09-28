locals {
  # NOTE: "DDR" is approximated by CPU generation families in AWS instance lines.
  # arm_ddr4 -> Graviton2 (m6g), arm_ddr5 -> Graviton3/4 generation (m7g)
  # amd_ddr4 -> EPYC older gen (m6a), amd_ddr5 -> EPYC newer gen (m7a)
  # arm_small -> Graviton burstable (t4g), amd_small -> x86 burstable (t3a)
  profiles = {
    arm_ddr4 = {
      architecture  = "arm64"
      instance_type = "m6g.large"
    }
    arm_ddr5 = {
      architecture  = "arm64"
      instance_type = "m7g.large"
    }
    amd_ddr4 = {
      architecture  = "x86_64"
      instance_type = "m6a.large"
    }
    amd_ddr5 = {
      architecture  = "x86_64"
      instance_type = "m7a.large"
    }
    intel_ddr5 = {
      architecture  = "x86_64"
      instance_type = "m7i.large"
    }
    arm_small = {
      architecture  = "arm64"
      instance_type = "t4g.small"
    }
    amd_small = {
      architecture  = "x86_64"
      instance_type = "t3a.small"
    }
  }

  enabled_profiles = {
    for name, cfg in local.profiles :
    name => merge(cfg, {
      ami_id        = cfg.architecture == "arm64" ? data.aws_ami.debian_arm64.id : data.aws_ami.debian_amd64.id
      instance_type = coalesce(var.instance_type_override, cfg.instance_type)
    })
    if lookup(var.profile_enabled, name, false)
  }

  common_tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }
}

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default_vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "debian_amd64" {
  most_recent = true
  owners      = ["136693071363"] # Debian official AWS account

  filter {
    name   = "name"
    values = ["debian-12-amd64-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_ami" "debian_arm64" {
  most_recent = true
  owners      = ["136693071363"] # Debian official AWS account

  filter {
    name   = "name"
    values = ["debian-12-arm64-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_s3_bucket" "app_artifacts" {
  bucket = var.source_bucket_name
}

resource "aws_iam_role" "ec2_role" {
  name_prefix = "${var.project_name}-ec2-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "ec2_s3_read" {
  name_prefix = "${var.project_name}-s3-read-"
  role        = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [
          "${data.aws_s3_bucket.app_artifacts.arn}/${var.source_zip_key}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          data.aws_s3_bucket.app_artifacts.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name_prefix = "${var.project_name}-ec2-profile-"
  role        = aws_iam_role.ec2_role.name

  tags = local.common_tags
}

resource "aws_key_pair" "generated" {
  count = var.instance_key_name == null ? 1 : 0

  key_name_prefix = "${var.project_name}-"
  public_key      = trimspace(file(var.ssh_public_key_path))

  tags = local.common_tags
}

resource "aws_security_group" "ec2" {
  name_prefix = "${var.project_name}-sg-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allow_ssh_cidr]
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "m-cqrs API"
  }

  ingress {
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "classical-cqrs API"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all egress"
  }

  tags = local.common_tags
}

resource "aws_instance" "app_host" {
  for_each = local.enabled_profiles

  ami                    = each.value.ami_id
  instance_type          = each.value.instance_type
  subnet_id              = data.aws_subnets.default_vpc_subnets.ids[0]
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = coalesce(var.instance_key_name, try(aws_key_pair.generated[0].key_name, null))

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    bucket_name = data.aws_s3_bucket.app_artifacts.bucket
    object_key  = var.source_zip_key
  })

  root_block_device {
    volume_size = var.instance_volume_size
    volume_type = var.instance_volume_type
    iops        = contains(["io1", "io2"], var.instance_volume_type) ? var.instance_volume_iops : null
  }

  tags = merge(local.common_tags, {
    Name    = "${var.project_name}-${each.key}"
    Profile = each.key
  })
}
