import { Construct } from 'constructs';
import { Application } from './lib/application'
import { CronJob } from './lib/cronjob';


export function buildChart(scope: Construct) {

    const release_name = "project-name";

    // Sample Application
    new Application(scope, `${release_name}-webapp`, {
        image: 'pennlabs/project-image:latest',
        port: 80
    });

    // Sample Cronjob
    new CronJob(scope, `${release_name}-cronjob`, {
        schedule: "0 8 * * *",
        image: "pennlabs/cronjob:latest",
        secret: "my-secret",
        cmd: ["python", "manage.py", "launch"],
    });

}



