import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { Application, ApplicationOptions } from './lib/application'
import { values } from "./values";
import { CronJob, CronJobOptions } from './lib/cronjob';

export interface Options {

  /**
  * Name of the release.
  * 
  */
  readonly release_name: string;

  /**
  * For compatibility purposes.
  * 
  * @default "0.0.0"
  */
  readonly deploy_version?: string;

  /**
  * What image tag to fetch.
  * 
  * @default "latest"
  */
  readonly image_tag?: string;

  /**
  * List of applications.
  */
  readonly applications: { [x: number]: ApplicationOptions };

  /**
  * List of cronjobs.
  * 
  * @default []
  */
  readonly cronjobs?: { [x: number]: CronJobOptions };

}


export class MyChart extends Chart {
  constructor(scope: Construct, name: string, props: Options) {
    super(scope, name);

    const release_name = props.release_name;
    const applications = props.applications;
    const cronjobs = props.cronjobs || [];

    // Loop through and generate each of the applications
    for (const options in applications) {
      new Application(this, `${release_name}-${applications[options].name}`, applications[options]);
    }

    // Loop through and generate each of the cronjobs
    for (const options in cronjobs) {
      new CronJob(this, `${release_name}-${cronjobs[options].name}`, cronjobs[options]);
    }

  }
}

const app = new App();
new MyChart(app, 'kittyhawk', values);
app.synth();
