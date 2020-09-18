// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application



const {google, deploymentmanager_v2} = require('googleapis');
const { deploymentmanager } = require('googleapis/build/src/apis/deploymentmanager');
const compute = google.compute('v1');
const deployments = deploymentmanager('v2').deployments;

const globalConfig = {
    cases:[
      {
        config: ""
      }  
    ]
}

async function taskPreview(configuration) {
    const authClient = await google.auth.getClient({
        scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/compute',
            'https://www.googleapis.com/auth/ndev.cloudman',
        ],
    });
    const projectId = await google.auth.getProjectId();

    const result = await deployments.insert({
        auth: authClient,
        project: projectId,
        preview: true,
        resource: {
            name: "bm-testdeployment",
            target: {
                config: {
                    content: JSON.stringify({
                        resources: [
                            {
                                name: "bm-testbucket",
                                type: "storage.v1.bucket",
                                properties: {
                                    storageClass: "STANDARD",
                                    location: "europe-west1",
                                    labels: {
                                        "keyOne": "valueOne"
                                    }
                                }
                            }

                        ]
                    }, 4, 2 )
                }
            }
        }
    })

    return result;

} //taskPreview()


const listDeployments = async ()=>{
    const authClient = await google.auth.getClient({
        scopes: [
          'https://www.googleapis.com/auth/cloud-platform',
          'https://www.googleapis.com/auth/compute',
          'https://www.googleapis.com/auth/compute.readonly',
          'https://www.googleapis.com/auth/ndev.cloudman.readonly',
        ],
      });

      const deployments = deploymentmanager("v2").deployments;
    
      const projectId = await google.auth.getProjectId();
      const result = await deployments.list({
        auth: authClient,
        project: projectId,
      })
      .catch( (err)=>{console.log(err)})

      return result.data;
}

/*
listDeployments()
.then((result)=>{
    console.log( 'deployments: ', result );
})
*/

taskPreview()
    .then( data=>console.log(data))
    .catch( err=>console.log(err))