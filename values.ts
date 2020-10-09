import { Options } from './main';

// import { Yaml } from "cdk8s";
// No run time type-checking :(
// export const values1 : Options = Yaml.load("./samples/ohq.yaml")[0] 

export const values : Options =
{
    release_name: "penn-clubs",
    deploy_version: "0.1.22",
    image_tag: "latest", // dynamically fetch this somehow??
    applications: [
        {
            name: 'redis',
            image: 'redis',
            port: 6379
        },
        {
            name: 'django-wgsi',
            image: 'pennlabs/penn-clubs-backend',
            secret: 'penn-clubs',
            replicas: 3,
            extraEnv: [
                { name: 'DOMAIN', value: "pennclubs.com" },
                { name: "DJANGO_SETTINGS_MODULE", value: "pennclubs.settings.production" }
            ],
            ingress: {
                hosts: [{ host: 'pennclubs.com', paths: ["/apis"] }]
            }
        }],
    cronjobs: [{
        name: "rank-clubs",
        schedule: "0 8 * * *",
        image: "pennlabs/penn-clubs-backend",
        secret: "penn-clubs",
        cmd: ["python", "manage.py", "rank"],
    },
    {
        name: "daily-notifications",
        schedule: "0 13 * * *",
        image: "pennlabs/penn-clubs-backend",
        secret: "penn-clubs",
        cmd: ["python", "manage.py", "daily_notifications"],
    }]
}

// console.log(JSON.stringify(values1))

