import { Construct } from 'constructs';
import { Ingress as IngressApiObject, IntOrString } from '../imports/k8s';


export interface IngressOptions {
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
     * List of ingress hosts. TODO: Flatten layout
     *
     * @default []
     */
    readonly hosts: { host: string, paths: string[] }[];
}


export class Ingress extends Construct {
    constructor(scope: Construct, appname: string, options: IngressOptions) {
        super(scope, `ingress-${appname}`);

        const port = options.port || 80;
        const ingress = options.ingress;

        if (ingress) {
            let tls = ingress.hosts.map(h => {
                // Regex to compute the apex domain
                const apex_domain = h.host.match(/[\w-]+\.[\w]+$/g)
                if (apex_domain != null) {
                    const host_string = apex_domain[0].split('.').join('-').concat("-tls");
                    return { hosts: [h.host], secretName: host_string }
                } else
                    throw `Ingress construction failed: apex domain regex failed on ${h}`
            })

            new IngressApiObject(this, `ingress-${appname}`, {
                metadata: {
                    name: appname,
                    namespace: 'default'
                },
                spec: {
                    tls,
                    rules:
                        ingress.hosts.map(h => {
                            return {
                                host: h.host,
                                http: {
                                    paths: h.paths.map(path => {
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