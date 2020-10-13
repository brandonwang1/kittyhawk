import { Volume as VolumeInterface, Container as ContainerInterface, ContainerPort, EnvFromSource, EnvVar, Probe, VolumeMount, SecretVolumeSource } from '../imports/k8s';


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
     * Periodic probe of container liveness. Container will be restarted if the probe fails.
     */
    readonly livenessProbe?: Probe;

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
     * Periodic probe of container service readiness.
     */
    readonly readinessProbe?: Probe;

    /**
     * Pod volumes to mount into the container's filesystem.
     */
    readonly volumeMounts?: VolumeMount[];

    constructor(options: ContainerOptions) {

        this.name = 'worker'
        this.image = options.image
        this.ports = [{ containerPort: options.port ?? 80 }]
        this.imagePullPolicy = options.pullPolicy || "IfNotPresent";
        this.command = options.cmd;
        this.volumeMounts = options.secretMounts;
        this.envFrom = options.secret ? [{ secretRef: { name: options.secret } }] : undefined;
        this.env = options.extraEnv

    }

}


export interface VolumeOptions {

    readonly name: string,
    readonly mountPath: string,
    readonly subPath: string

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

