# Kittyhawk

Kittyhawk is the automated Kubernetes YAML generator for Penn Labs. 
With Kittyhawk, you can define an application's deployment configuration in Typescript using objects called [constructs](https://cdk8s.io/docs/v1.0.0-beta.3/concepts/constructs/).

## Getting Started

The easiest way to get started is by creating a `k8s` folder in your project, and cloning the [Kittyhawk template](https://github.com/pennlabs/kittyhawk-template) inside. You will also need to add the circleCI orb (WIP).

To initialize the project, run
'''
npx projen
'''

Afterwards, write your configuration in the buildChart function in the main.ts file. 

This is a sample configuration deploying a Django Application and a React Application for Penn Clubs:

```
import { DjangoApplication, ReactApplication, synth } from '@pennlabs/kittyhawk';
import { Construct } from 'constructs'; 

export function buildChart(scope: Construct) {

  /** Penn Clubs **/
  new DjangoApplication(scope, 'django-asgi', {
    image: 'pennlabs/penn-clubs-backend',
    tag: 'latest',
    secret: 'penn-clubs',
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/api/ws'],
    extraEnv: [
      { name: 'DJANGO_SETTINGS_MODULE', value: 'pennclubs.settings.production' },
      { name: 'REDIS_HOST', value: 'penn-clubs-redis' }],
  })

  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-clubs-frontend',
    tag: 'latest',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    extraEnv: [{ name: 'PORT', value: '80' }],
  })

}

// Synthesizes the chart
synth(buildChart);

```

Next, run `yarn run build` to synthesize your configuration. The generated YAML will be saved to a file located at `k8s/dist/kittyhawk.k8s.yaml`. On every push to a PR branch, Circle CI will automatically generate the configuration. On every push to the master branch, CircleCI will also automatically apply/deploy the generated YAML to production.



## Available Constructs

COPY DOCS FROM: https://github.com/pennlabs/icarus/blob/master/USER_GUIDE.md

You can find the full API reference [here:](https://pennlabs.github.io/kittyhawk/index.html) 

- [Application](lib/application.ts) - the base class for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and a properties object containing a valid configuration. 
    -- ReactApplication and DjangoApplication both subclass Application, and contain additional checks to make sure the configuration is correct.


### Options
- image (string) - The Docker image to use.
- port
- TODO

- [Cronjob](lib/cronjob.ts) - the class for deploying a cronjob. To create an cronjob, it must be passed a scope, name and a properties object containing a valid configuration. 
