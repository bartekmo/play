### GCP terraform
terraform {
  required_version = ">=0.12.0"
  required_providers {
    google      = ">=2.11.0"
  }
}
provider "google" {
  project      = var.project
  region       = var.region
  zone         = var.zone
  access_token = var.token
}

# Create log disk
resource "google_compute_disk" "logdisk" {
  name = "${var.fgtname}-logdisk"
  size = 30
  type = "pd-standard"
  zone = var.zone
  disk_encryption_key {
    kms_key_self_link = var.cmek_key
  }
}




# Create FGTVM compute instance
resource "google_compute_instance" "fortigate" {
  name           = var.fgtname
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = "true"

  tags = ["fgt"]

  boot_disk {
    initialize_params {
      image = var.image
    }
    kms_key_self_link = var.cmek_key
  }
  attached_disk {
    source = google_compute_disk.logdisk.name
  }
  network_interface {
    subnetwork = "projects/${var.project}/regions/${var.region}/default"
    access_config {
    }
  }
  metadata = {
    user-data = fileexists("${path.module}/${var.user_data}") ? "${file(var.user_data)}" : null
    license = fileexists("${path.module}/${var.license_file}") ? "${file(var.license_file)}" : null
  }
  service_account {
    scopes = ["userinfo-email", "compute-ro", "storage-ro"]
  }

}


# Output
output "FortiGate-NATIP" {
  value = google_compute_instance.fortigate.network_interface.0.access_config.0.nat_ip
}
output "FortiGate-InstanceName" {
  value = google_compute_instance.fortigate.name
}
output "FortiGate-Username" {
  value = "admin"
}
output "FortiGate-Password" {
  value = google_compute_instance.fortigate.instance_id
}
