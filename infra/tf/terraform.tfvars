aws_region         = "eu-central-1"
project_name       = "perf-research"
source_bucket_name = "temp-perf-research-sources"
source_zip_key     = "source.zip"

profile_enabled = {
  arm_ddr4   = false
  arm_ddr5   = false
  amd_ddr4   = false
  amd_ddr5   = false
  intel_ddr5 = true # m7i.large (Intel, x86_64) -> uses Debian amd64 AMI
  arm_small  = false
  amd_small  = false
}

# null -> use the profile default (intel_ddr5 = m7i.large). Set a value to force another size.
instance_type_override = null
ssh_public_key_path = "./keys/perf-research-ed25519.pub"
allow_ssh_cidr      = "0.0.0.0/0"

instance_volume_size = 100
instance_volume_type = "gp3"
