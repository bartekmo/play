#! /bin/bash
apt-get update
apt-get install virtualenv git python3-pip -y
cd /root
virtualenv -p python3 venv
source venv/bin/activate
pip install google-cloud-bigquery
pip install pandas
PROJECT_ID=`curl http://169.254.169.254/computeMetadata/v1/project/project-id -H "Metadata-Flavor: Google"`
echo "
from google.auth import compute_engine
from google.cloud import bigquery
credentials = compute_engine.Credentials(
    service_account_email=\"bigquery-qwiklab@$PROJECT_ID.iam.gserviceaccount.com\")
query = '''
SELECT
  year,
  COUNT(1) as num_babies
FROM
  publicdata.samples.natality
WHERE
  year > 2000
GROUP BY
  year
'''
client = bigquery.Client(
    project=\"$PROJECT_ID\",
    credentials=credentials)
print(client.query(query).to_dataframe())
" > query.py
cat query.py
