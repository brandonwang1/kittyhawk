import { Construct } from 'constructs';
import { CronJob as CronJobApiObject } from '../imports/k8s';


export interface CronJobOptions {

    /**
     * CronJob name
     */
    readonly name: string;

    /**
     * CronJob schedule
     */
    readonly schedule: string;

    /**
     * CronJob image 
     * 
     */
    readonly image: string;

    /**
     * CronJob secrets
     * 
     * @default undefined
     * 
     */
    readonly secret?: string;

    /**
    * CronJob commands
    * 
    * @default []
    * 
    */
    readonly cmd: string[];

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

}


export class CronJob extends Construct {
    constructor(scope: Construct, id: string, options: CronJobOptions) {
        super(scope, id);

        const name = options.name;
        const schedule = options.schedule;
        // const restartPolicy = options.restartPolicy || "Never";
        const failureLimit = options.failureLimit ?? 1;
        const successLimit = options.successLimit ?? 1;

        new CronJobApiObject(this, `cronjob-${name}`, {
            spec: {
                schedule: schedule,
                jobTemplate: {},
                failedJobsHistoryLimit: failureLimit,
                successfulJobsHistoryLimit: successLimit,
            }
        });
    }
}