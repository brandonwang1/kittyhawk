import { Chart } from '../lib';
import { Testing } from 'cdk8s';
import { Construct } from 'constructs';
import { CronJob } from '../lib/cronjob';
import { Application, DjangoApplication, ReactApplication } from '../lib/application'


const release_name = "RELEASE_NAME";

/** UNIT TEST CONFIGS */
export function buildProbeChart(scope: Construct) {

    /** Probe tests **/
    new Application(scope, `${release_name}-serve`, {
        image: 'pennlabs/website',
        readinessProbe: { path: '/', delay: 5 }, // Default on?
        livenessProbe: { command: ["test", "command"], period: 5 }
    })
}

export function buildAutoscalingChart(scope: Construct) {

    /** Autoscaling test **/
    new Application(scope, `${release_name}-serve`, {
        image: 'pennlabs/website',
        autoScalingOptions: { cpu: 80 }
    })
}


/** INTEGRATION TEST CONFIGS */

export function buildWebsiteChart(scope: Construct) {

    /** Penn Labs Website **/
    new Application(scope, `${release_name}-serve`, {
        image: 'pennlabs/website',
        ingress: { hosts: [{ host: 'pennlabs.org', paths: ['/'] }] },
    })
}

export function buildBasicsChart(scope: Construct) {

    /** Penn Basics **/
    new Application(scope, `${release_name}-react`, {
        image: 'pennlabs/penn-basics',
        secret: 'penn-basics',
        extraEnv: [{ name: 'PORT', value: '80' }],
        ingress: { hosts: [{ host: 'pennbasics.com', paths: ['/'] }] },
    })
}

export function buildOHQChart(scope: Construct) {

    /** OHQ (Part of it) **/
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

}

export function buildCoursesChart(scope: Construct) {

    /** Penn Courses (Part of it) **/
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
}

export function buildPlatformChart(scope: Construct) {

    /** Platform **/
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

export function buildClubsChart(scope: Construct) {

    /** Penn Clubs **/
    new DjangoApplication(scope, `${release_name}-django-asgi`, {
        image: 'pennlabs/penn-clubs-backend',
        secret: 'penn-clubs',
        cmd: ["/usr/local/bin/asgi-run"],
        replicas: 2,
        extraEnv: [{ name: 'DOMAIN', value: "pennclubs.com" },
        { name: "DJANGO_SETTINGS_MODULE", value: "pennclubs.settings.production" },
        { name: "REDIS_HOST", value: "penn-clubs-redis" }],
        ingress:
            { hosts: [{ host: 'pennclubs.com', paths: ["/api/ws"] }] },
    })

    new ReactApplication(scope, `${release_name}-react`, {
        image: 'pennlabs/penn-clubs-frontend',
        replicas: 2,
        extraEnv: [{ name: 'DOMAIN', value: "pennclubs.com" },
        { name: "PORT", value: "80" }],
        ingress:
            { hosts: [{ host: 'pennclubs.com', paths: ["/"] }] },
    })

}



/** Helper function to run each chart test */
const chartTest = (build: Function) => {
  const app = Testing.app();
  const chart = new Chart(app, 'kittyhawk', build);
  const results = Testing.synth(chart)
  expect(results).toMatchSnapshot();
}

describe('Unit Tests', () => {
  test('Autoscaling', () => chartTest(buildAutoscalingChart));
  
  test('Readiness/Liveliness Probes', () => chartTest(buildProbeChart));
});

describe('Integration Tests', () => {
  test('Penn Labs Website', () => chartTest(buildWebsiteChart));

  test('Penn Basics', () => chartTest(buildBasicsChart));

  test('OHQ', () => chartTest(buildOHQChart));

  test('Penn Courses', () => chartTest(buildCoursesChart));

  test('Platform API', () => chartTest(buildPlatformChart));

  test('Penn Clubs', () => chartTest(buildClubsChart));

});
