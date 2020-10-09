import { Construct } from 'constructs';
import { Service as ServiceApiObject, IntOrString } from '../imports/k8s';


export interface ServiceOptions {

    /**
      * The name of the application.
      */
    readonly name: string;

    /**
     * External port.
     *
     * @default 80
     */
    readonly port?: number;

      /**
   * Internal port.
   *
   * @default port
   */
  readonly containerPort?: number;


}


export class Service extends Construct {
    constructor(scope: Construct, appname: string, id: string, options: ServiceOptions) {
        super(scope, id);

        const port = options.port || 80;
        const containerPort = options.containerPort || port;
        const label = { name: appname };

        new ServiceApiObject(this, id, {
            spec: {
              type: 'ClusterIP',
              ports: [{ port, targetPort: IntOrString.fromNumber(containerPort) }],
              selector: label
            }
          });

    }
}