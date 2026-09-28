output "enabled_profiles" {
  value = [for name, enabled in var.profile_enabled : name if enabled]
}

output "selected_instance_types" {
  value = { for name, cfg in local.enabled_profiles : name => cfg.instance_type }
}

output "s3_bucket_name" {
  value = data.aws_s3_bucket.app_artifacts.bucket
}

output "s3_object_key" {
  value = var.source_zip_key
}

output "ec2_instance_ids" {
  value = { for name, instance in aws_instance.app_host : name => instance.id }
}

output "ec2_public_ips" {
  value = { for name, instance in aws_instance.app_host : name => instance.public_ip }
}

output "ec2_public_dns" {
  value = { for name, instance in aws_instance.app_host : name => instance.public_dns }
}
