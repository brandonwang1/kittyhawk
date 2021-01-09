import { Construct } from 'constructs';
import { Deployment, DeploymentProps } from './deployment';
import { Ingress, IngressProps } from './ingress';
import { Service, ServiceProps } from './service'
import { Certificate } from './certificate';

/**
 * Warning: Before editing any interfaces, make sure that none of the interfaces will have 
 * property names that conflict with each other. Typescript may not throw an error and it 
 * could cause problems.
 */
export interface ApplicationProps extends IngressProps, DeploymentProps,
  ServiceProps { }


export class Application extends Construct {
  constructor(scope: Construct, appname: string, props: ApplicationProps) {
    super(scope, appname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME || 'undefined_release';
    const fullname = `${release_name}-${appname}`

    new Service(this, fullname, props);

    new Deployment(this, fullname, props);

    if (props.ingress) {
      new Ingress(this, fullname, props)

      new Certificate(this, fullname, props)
    }
  }
}

/**
 * Helper function that first checks to make sure that the environment variable array 
 * doesn't already contain the env var, then inserts it into the array.
 * @param envArray array of environment variables to insert into 
 * @param envKey name of the environment variable to insert
 * @param envValue value of the environment variable
 */
function insertIfNotPresent(envArray: { name: string, value: string }[], envKey: string, envValue: any) {
  const envSettingsModule = envArray?.filter(env => (env.name === envKey));
  if (envSettingsModule?.length > 0) {
    throw new Error(`${envKey} should not be redefined as an enviroment variable.`)
  }
  envArray.push({ name: envKey, value: envValue });

}
export interface DjangoApplicationProps extends ApplicationProps {
  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];

  /**
   * DJANGO_SETTINGS_MODULE environment variable.
   */
  readonly djangoSettingsModule: string;
}

export class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, props: DjangoApplicationProps) {

    let djangoExtraEnv = props.extraEnv || [];

    // Insert DJANGO_SETTINGS_MODULE and DOMAIN
    insertIfNotPresent(djangoExtraEnv, 'DJANGO_SETTINGS_MODULE', props.djangoSettingsModule)
    insertIfNotPresent(djangoExtraEnv, 'DOMAIN', props.domain)

    // Configure the ingress using ingressPaths.
    const djangoIngress = [{ host: props.domain, paths: props.ingressPaths }]

    // If everything passes, construct the Application.
    super(scope, appname, {
      ...props,
      extraEnv: djangoExtraEnv,
      ingress: djangoIngress,
    });
  }
}

export interface ReactApplicationProps extends ApplicationProps {
  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];
}

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, props: ReactApplicationProps) {

    let reactExtraEnv = props.extraEnv || [];

    // Insert DOMAIN as an env variable.
    insertIfNotPresent(reactExtraEnv, 'DOMAIN', props.domain)

    // Check if the env variables contains PORT
    const envSettingsModule = props.extraEnv?.filter(env => (env.name === 'PORT'));
    if (!envSettingsModule?.length) {
      throw new Error('React Application must define a PORT enviroment variable.')
    }

    // Configure the ingress using ingressPaths.
    const reactIngress = [{ host: props.domain, paths: props.ingressPaths }]

    // If everything passes, construct the Application.
    super(scope, appname, {
      ...props,
      extraEnv: reactExtraEnv,
      ingress: reactIngress,
    });
  }
}

export class RedisApplication extends Application {
  constructor(scope: Construct, appname: string, redisProps: ApplicationProps) {
    super(scope, appname, {
      ...redisProps,
      image: redisProps.image || 'redis',
      tag: redisProps.tag || '6.0',
      port: redisProps.port || 6379,
    });
  }
}