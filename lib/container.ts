import { Volume as VolumeInterface, Container as ContainerInterface, ContainerPort, EnvFromSource, EnvVar, Probe as ProbeInterface, VolumeMount, SecretVolumeSource, HttpGetAction, ExecAction } from '../imports/k8s';


export interface ContainerOptions {
    /**
     * The Docker image to use for this service.
     */
    readonly image: string;

    /**
     * Number of replicas to start.
     *
     * @default 1
     */
    readonly replicas?: number;

    /**
     * Secrets for deployment.
     *
     * @default undefined
     */
    readonly secret?: string;

    /**
    * Container commands.
    * 
    * @default []
    * 
    */
    readonly cmd?: string[];

    /**
     * External port.
     *
     * @default 80
     */
    readonly port?: number;

    /**
     * Extra env variables.
     *
     * @default []
     */
    readonly extraEnv?: { name: string, value: string }[];

    /**
     * Secret mounts for deployment container.
     *
     * @default []
     */
    readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]

    /**
     * Internal port.
     *
     * @default 8080
     */
    readonly containerPort?: number;

    /**
    * Container pull policy. 
    * 
    * @default "IfNotPresent"
    * 
    */
    readonly pullPolicy?: "IfNotPresent" | "Always" | "Never";

    /**
    * Liveliness Probe definitions for the container.
    */
    readonly livenessProbe?: probeOptions

    /**
    * Liveliness Probe definitions for the container.
    */
    readonly readinessProbe?: probeOptions

}

export interface probeOptions {
    /**
     * Sends a HTTP request to this path for the probe check. Only provide this OR a command.
     */
    readonly path?: string;

    /**
     * Comand to execute on the container for the probe. Only provide this OR a HTTP path.
     */
    readonly command?: string[];

    /**
     * Short for initialDelaySeconds: Number of seconds after the container has started before liveness or readiness probes are initiated. 
     * 
     * @default 0
     */
    readonly delay?: number;

    /**
     * Short for periodSeconds: How often (in seconds) to perform the probe. 
     * 
     * @default 10
     */
    readonly period?: number;
}


export class Container implements ContainerInterface {

    /**
     * Entrypoint array. 
     */
    readonly command?: string[];

    /**
     * List of environment variables to set in the container. 
     */
    readonly env?: EnvVar[];

    /**
     * List of sources to populate environment variables in the container. 
     */
    readonly envFrom?: EnvFromSource[];

    /**
     * Docker image name. 
     */
    readonly image?: string;

    /**
     * Image pull policy. 
     */
    readonly imagePullPolicy?: string;

    /**
     * Name of the container specified as a DNS_LABEL.
     */
    readonly name: string;

    /**
     * List of ports to expose from the container. 
     *
     */
    readonly ports?: ContainerPort[];

    /**
     * Pod volumes to mount into the container's filesystem.
     */
    readonly volumeMounts?: VolumeMount[];

    /**
     * Periodic probe of container service readiness.
     */
    readonly readinessProbe?: Probe;

    /**
     * Periodic probe of container liveness. 
     */
    readonly livenessProbe?: Probe;

    constructor(options: ContainerOptions) {

        this.name = 'worker'
        this.image = options.image
        this.ports = [{ containerPort: options.port ?? 80 }]
        this.imagePullPolicy = options.pullPolicy || "IfNotPresent";
        this.command = options.cmd;
        this.volumeMounts = options.secretMounts;
        this.envFrom = options.secret ? [{ secretRef: { name: options.secret } }] : undefined;
        this.env = options.extraEnv;
        this.readinessProbe = options.readinessProbe && new Probe(options.readinessProbe);
        this.livenessProbe = options.livenessProbe && new Probe(options.livenessProbe);
    }

}

export class Probe implements ProbeInterface {

    /**
     * One and only one of the following should be specified. Exec specifies the action to take.
     */
    readonly exec?: ExecAction;

    /**
     * HTTPGet specifies the http request to perform.
     */
    readonly httpGet?: HttpGetAction;

    /**
     * Number of seconds after the container has started before liveness probes are initiated. 
     */
    readonly initialDelaySeconds?: number;

    /**
     * How often (in seconds) to perform the probe. Default to 10 seconds.
     *
     */
    readonly periodSeconds?: number;

    constructor(options: probeOptions) {
        this.initialDelaySeconds = options.delay ?? 1;
        this.periodSeconds = options.period ?? 10;
        if (options.command) {
            this.exec = { command: options.command }
        } else if (options.path) {
            this.httpGet = { path: options.path, port: 80 }
        } else throw new Error("Must provide either probe command or HTTP path")
    }
}

export interface VolumeOptions {

    /**
     * Secret volume name. 
     */
    readonly name: string;

    /**
     * Secret volume mountPath. 
     */
    readonly mountPath: string;

    /**
     * Secret volume mountPath. 
     */
    readonly subPath: string;

}


export class Volume implements VolumeInterface {

    /**
     * Name of the container specified as a DNS_LABEL.
     */
    readonly name: string;

    /**
     * List of ports to expose from the container. 
     *
     */
    readonly secret?: SecretVolumeSource

    constructor(options: VolumeOptions) {
        let mountString = (a: string) => a.toLowerCase().split('_').join('-');

        this.name = `${mountString(options.name)}-${mountString(options.subPath)}`
        this.secret = {
            secretName: options.name,
            items: [{
                key: options.subPath,
                path: options.subPath
            }]
        }
    }


}

