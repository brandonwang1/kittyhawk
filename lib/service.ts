import { Construct } from 'constructs';
import { Service as ServiceApiObject, IntOrString } from '../imports/k8s';


export interface ServiceOptions {
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
  constructor(scope: Construct, appname: string, options: ServiceOptions) {
    super(scope, `service-${appname}`);

    const port = options.port || 80;
    const containerPort = options.containerPort || port;

    new ServiceApiObject(this, `service-${appname}`, {
      metadata: {
        name: appname
      },
      spec: {
        type: 'ClusterIP',
        ports: [{ port, targetPort: IntOrString.fromNumber(containerPort) }],
        selector: { name: appname }
      }
    });

  }
}