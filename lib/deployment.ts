import { Construct } from 'constructs';
import { Deployment as DeploymentApiObject } from '../imports/k8s';


export interface DeploymentOptions {

    /**
      * The name of the application.
      */
    readonly name: string;

    /**
     * The Docker image to use for this service.
     */
    readonly image: string;

    /**
     * Number of replicas.
     *
     * @default 1
     */
    readonly replicas?: number;

    /**
     * Number of replicas.
     *
     * @default undefined
     */
    readonly secret?: string;

    /**
     * External port.
     *
     * @default 80
     */
    readonly port?: number;

    /**
     * Extra envs.
     *
     * @default []
     */
    readonly extraEnv?: { name: string, value: string | number }[];

    /**
     * Internal port.
     *
     * @default 8080
     */
    readonly containerPort?: number;
}


export class Deployment extends Construct {
    constructor(scope: Construct, appname : string, id: string, options: DeploymentOptions) {
        super(scope, id);

        // const name = options.name;
        const port = options.port || 80;
        const containerPort = options.containerPort || port;
        const label = { name: appname };
        const replicas = options.replicas ?? 1;


        new DeploymentApiObject(this, id, {
            spec: {
                replicas: replicas,
                selector: {
                    matchLabels: label
                },
                strategy: {
                    type: 'RollingUpdate',
                    rollingUpdate:
                    {
                        maxSurge: 3,
                        maxUnavailable: 0
                    }
                },
                template: {
                    metadata: { labels: label },
                    spec: {
                        containers: [
                            {
                                name: 'worker',
                                image: options.image,
                                ports: [{ containerPort }]
                            }
                        ]
                    }
                }
            }
        });
    }
}