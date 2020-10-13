import { Construct } from 'constructs';
import { CronJob as CronJobApiObject } from '../imports/k8s';
import { Container, ContainerOptions, Volume } from './container';


export interface CronJobOptions extends ContainerOptions {

    /**
     * CronJob schedule
     */
    readonly schedule: string;

    /**
    * CronJob restart policy
    * 
    * @default "Never"
    * 
    */

    readonly restartPolicy?: "Always" | "OnFailure" | "Never";

    /**
    * CronJob successLimit
    * 
    * @default 1
    * 
    */
    readonly successLimit?: number;

    /**
    * CronJob failureLimit
    * 
    * @default 1
    * 
    */
    readonly failureLimit?: number;

    /**
    * Secret mounts for cronjob container.
    *
    * @default []
    */
    readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]

}


export class CronJob extends Construct {
    constructor(scope: Construct, jobname: string, options: CronJobOptions) {
        super(scope, jobname);

        const label = { name: jobname };
        const schedule = options.schedule;
        const restartPolicy = options.restartPolicy || "Never";
        const failureLimit = options.failureLimit ?? 1;
        const successLimit = options.successLimit ?? 1;
        const containers: Container[] = [new Container(options)];
        const volumes: Volume[] | undefined = options.secretMounts && options.secretMounts.map(m => new Volume(m))


        new CronJobApiObject(this, `cronjob-${jobname}`, {
            metadata: {
                name: jobname,
                namespace: 'default',
                labels: label
              },
            spec: {
                schedule: schedule,
                jobTemplate: {
                    spec: {
                        template: {
                            spec: {
                                restartPolicy: restartPolicy,
                                containers: containers,
                                volumes: volumes
                            }
                        }

                    }
                },
                failedJobsHistoryLimit: failureLimit,
                successfulJobsHistoryLimit: successLimit,
            }
        });
    }
}