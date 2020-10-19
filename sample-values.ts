import { Construct } from 'constructs';
import { CronJob } from './lib/cronjob';
import { Application, DjangoApplication } from './lib/application'


const release_name = "RELEASE_NAME";

export function buildChart(scope: Construct) {

    /** Probes test case **/
    // new Application(scope, `${release_name}-serve`, {
    //     image: 'pennlabs/website',
    //     ingress: { hosts: [{ host: 'pennlabs.org', paths: ['/'] }] },
    //     readinessProbe: { path: '/', delay: 5 },
    //     livenessProbe: { command: ["test", "command"], period: 5 }
    // })

    /** OHQ (Part of it) - Checked! **/
    new DjangoApplication(scope, `${release_name}-django-asgi`, {
        image: 'pennlabs/office-hours-queue-backend',
        secret: 'office-hours-queue',
        cmd: ["/usr/local/bin/asgi-run"],
        replicas: 2,
        extraEnv: [{ name: 'DOMAIN', value: 'ohq.io' },
        { name: 'DJANGO_SETTINGS_MODULE', value: 'officehoursqueue.settings.production' },
        { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
        ingress: { hosts: [{ host: 'ohq.io', paths: ['/api/ws'] }] }
    })

}

export function buildProductChart(scope: Construct) {

    /** Penn Labs Website - Checked! **/
    new Application(scope, `${release_name}-serve`, {
        image: 'pennlabs/website',
        ingress: { hosts: [{ host: 'pennlabs.org', paths: ['/'] }] },
    })

    /** Penn Basics - Checked! **/
    new Application(scope, `${release_name}-react`, {
        image: 'pennlabs/penn-basics',
        secret: 'penn-basics',
        extraEnv: [{ name: 'PORT', value: '80' }],
        ingress: { hosts: [{ host: 'pennbasics.com', paths: ['/'] }] },
    })

    /** OHQ (Part of it) - Checked! **/
    new DjangoApplication(scope, `${release_name}-django-asgi`, {
        image: 'pennlabs/office-hours-queue-backend',
        secret: 'office-hours-queue',
        cmd: ["/usr/local/bin/asgi-run"],
        replicas: 2,
        extraEnv: [{ name: 'DOMAIN', value: 'ohq.io' },
        { name: 'DJANGO_SETTINGS_MODULE', value: 'officehoursqueue.settings.production' },
        { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
        ingress: { hosts: [{ host: 'ohq.io', paths: ['/api/ws'] }] },
    })

    new CronJob(scope, `${release_name}-calculate-waits`, {
        schedule: "*/5 * * * *",
        image: "pennlabs/office-hours-queue-backend",
        secret: "office-hours-queue",
        cmd: ["python", "manage.py", "calculatewaittimes"],
    });

    /** Penn Courses (Part of it) - Checked! **/
    new Application(scope, `${release_name}-backend`, {
        image: 'pennlabs/penn-courses-backend',
        secret: 'penn-courses',
        cmd: ["celery", "worker", "-A", "PennCourses", "-Q", "alerts,celery", "-linfo"],
        replicas: 3,
        extraEnv: [{ name: 'PORT', value: '80' },
        { name: 'DJANGO_SETTINGS_MODULE', value: 'PennCourses.settings.production' }],
        ingress: {
            hosts: [
                { host: 'penncourseplan.com', paths: ["/api", "/admin", "/accounts", "/assets"] },
                { host: 'penncoursealert.com', paths: ["/api", "/admin", "/accounts", "/assets", "/webhook"] },
                { host: 'review.penncourses.org', paths: ["/api", "/admin", "/accounts", "/assets"] },
            ]
        },
    })

    /** Platform - Checked! **/
    new DjangoApplication(scope, `${release_name}-platform`, {
        image: 'pennlabs/platform',
        secret: 'platform',
        port: 443,
        extraEnv: [{ name: 'DOMAIN', value: "platform.pennlabs.org" },
        { name: "DJANGO_SETTINGS_MODULE", value: "Platform.settings.production" }],
        ingress:
            { hosts: [{ host: 'platform.pennlabs.org', paths: ["/"] }] },
        secretMounts: [{ name: 'platform', subPath: 'SHIBBOLETH_CERT', mountPath: '/etc/shibboleth/sp-cert.pem' },
        { name: 'platform', subPath: 'SHIBBOLETH_KEY', mountPath: '/etc/shibboleth/sp-key.pem' }]
    })

}
