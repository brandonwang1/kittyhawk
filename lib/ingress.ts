import { Construct } from 'constructs';
import { Ingress as IngressApiObject, IntOrString } from '../imports/k8s';


export interface IngressOptions {

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
     * Ingresses. TODO: Rewrite this using IngressSpec?? so we get typechecking??
     *
     * @default undefined
     */
    readonly ingress?: HostsConfig;
}


export interface HostsConfig {
    /**
     * List of ingress hosts.
     *
     * @default []
     */
    readonly hosts: { host: string, paths: string[] }[];
}


export class Ingress extends Construct {
    constructor(scope: Construct, appname: string, id: string, options: IngressOptions) {
        super(scope, id);

        const port = options.port || 80;
        const ingress = options.ingress;


      // generate the objects in a nested loop
        if (ingress !== undefined) {
            new IngressApiObject(this, id, {
                spec: {
                    tls:
                        ingress.hosts.map(host => {
                            // const regex = new RegExp("[\w-]+\.[\w]+$")
                            return { hosts: [host.host], secretName: host.host + "-tls" }
                        }),
                    rules:
                        ingress.hosts.map(host => {
                            return {
                                host: host.host,
                                http: {
                                    paths: host.paths.map(path => {
                                        return {
                                            path: path,
                                            backend: {
                                                serviceName: appname,
                                                servicePort: IntOrString.fromNumber(port)
                                            }
                                        }
                                    })
                                }
                            }
                        })
                }
            });
        }
    }
}