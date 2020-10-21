# User Guide (Under Construction)

## Available Classes

- [Application](lib/application.ts) - the base class for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and an object containing a valid configuration. It's subclassed into ReactApplication and DjangoApplication, which have additional checks to make sure the configuration is correct.
    - TODO: Generate some documentation containing the acceptable configuration options.

- [Cronjob](lib/cronjob.ts) - the class for deploying a cronjob. To create an cronjob, it must be passed a scope, name and an object containing a valid configuration. 