# GCP region
variable "region" {
  type    = string
  default = "europe-west1" #Default Region
}
# GCP zone
variable "zone" {
  type    = string
  default = "europe-west1-c" #Default Zone
}
# GCP project name
variable "project" {
  type    = string
  default = ""
}
# GCP oauth access token
variable "token" {
  type    = string
  default = ""
}
# FortiGate Image name
# 6.4.5 payg is projects/fortigcp-project-001/global/images/fortinet-fgtondemand-645-20210302-001-w-license
# 6.4.5 byol is projects/fortigcp-project-001/global/images/fortinet-fgt-645-20210302-001-w-license
variable "image" {
  type    = string
  default = "projects/fortigcp-project-001/global/images/fortinet-fgt-645-20210302-001-w-license"
}
# GCP instance machine type
variable "machine_type" {
  type    = string
  default = "n1-standard-1"
}

variable "fgtname" {
  type    = string
  default = "bm-fgt-cmek"
}

variable "cmek_key" {
  type    = string
  default = "projects/security-demo-40net/locations/global/keyRings/bm-kr-global/cryptoKeys/bm-dummy-key1"
}


# user data for bootstrap fgt configuration
variable "user_data" {
  type    = string
  default = "config.txt"
}

# user data for bootstrap fgt license file
variable "license_file" {
  type    = string
  default = "license.lic" #FGT BYOL license
}
