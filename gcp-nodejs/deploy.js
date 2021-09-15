// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application



const {google, deploymentmanager_v2} = require('googleapis');
const { deploymentmanager } = require('googleapis/build/src/apis/deploymentmanager');
const compute = google.compute('v1');

const globalConfig = {
    cases:[
      {
        config: {
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
        }
      }  
    ]
}

var authClient = null;

function authGCP() {
    process.stderr.write( "Authenticating... " );

    return new Promise((resolve,reject)=>{
        authClient = google.auth.getClient({
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/compute',
                'https://www.googleapis.com/auth/ndev.cloudman',
            ],
        })
        .then((authClient)=>{
            process.stderr.write( "done ("+authClient.projectId+")\n" );
            resolve(authClient)
        })
        .catch(reject)
    })
}

function taskPreview(deploymentName, dmConfiguration) {
    process.stderr.write( "Starting new deployment preview... " );
    return new Promise((resolve,reject)=>{
        deploymentmanager('v2').deployments.insert({
            auth: authClient,
            project: authClient.projectId,
            preview: true,
            resource: {
                name: deploymentName,
                target: {
                    config: {
                        content: JSON.stringify({
                            dmConfiguration
                        }, 4, 2 )
                    }
                }
            }
        })
            .then( result=>{
                process.stderr.write( result.statusText+"\n" );
                resolve(result.data)
            })
            .catch( reject( new Error( "Problem inserting deployment" )))
    })
} //taskPreview()


async function dmWaitReady(deployment) {

    process.stderr.write( "Waiting for deployment "+deployment.name );

    return new Promise(async (resolve,reject)=>{
        let deployStatus = null;
        let triesCnt = 0;
        let result = null;
        do {
            process.stderr.write('.');

            await new Promise(resolve => setTimeout(resolve, 1000));
            triesCnt++;
            result = await deploymentmanager('v2').deployments.get({
                auth: authClient,
                project: projectId,
                deployment: deployment.name
            })
            .catch( reject )
            deployStatus = result.data.operation.status;
        } while( deployStatus!="DONE" && triesCnt<20 )
        
        if ( deployStatus=="DONE") {
            process.stderr.write( deployStatus+"\n" );
            resolve( result.data );
        } else {
            reject( new Error( "Deployment not done on time" ))
        }
    })
}

async function dmGetManifest(deployment) {
    process.stderr.write( "Getting manifest...");

    return new Promise(async (resolve,reject)=>{
        deploymentmanager('v2').manifests.get({
            auth: authClient,
            project: projectId,
            deployment: deployment.name,
            manifest: deployment.update.manifest.split('/').slice(-1)[0]
        })
        .then(result=>{
            process.stderr.write(" OK\n");
            console.log( result.data.config.content );
            resolve( result.data )
        })
        .catch(err=>reject(err))
    })
}

async function dmDeleteDeployment(deployment) {
    process.stderr.write( "Deleting deployment..." );

    return new Promise( async (resolve,reject)=>{
        const authClient = await google.auth.getClient({
            scopes: [
              'https://www.googleapis.com/auth/cloud-platform'
            ],
        });
        const projectId = await google.auth.getProjectId();
        let result = await deploymentmanager('v2').deployments.delete({
            project: projectId,
            deployment: deployment.name
        })
        .then(result=>resolve(result))
        .catch(err=>reject(err))
    })
}

authGCP()
    .then( taskPreview( "bm-test1", globalConfig.cases[0].config ))
//    .then( dmWaitReady )
 //   .then( dmGetManifest )
    .then( console.log )
    .catch( err=>console.log(err))