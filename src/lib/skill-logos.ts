/**
 * Skill name -> logo file in public/skills (Simple Icons, in each brand's colour).
 * Skills without an official logo are left out and show their group's icon instead.
 */
export const skillLogos: Record<string, string> = {
  Java: 'openjdk',
  Python: 'python',
  'C++': 'cplusplus',
  JavaScript: 'javascript',
  'Spring Boot': 'springboot',
  'Spring Security': 'springsecurity',
  'Spring Data JPA': 'spring',
  Hibernate: 'hibernate',
  Keycloak: 'keycloak',
  PostgreSQL: 'postgresql',
  MySQL: 'mysql',
  MongoDB: 'mongodb',
  Redis: 'redis',
  Elasticsearch: 'elasticsearch',
  Flyway: 'flyway',
  Liquibase: 'liquibase',
  Kafka: 'apachekafka',
  RabbitMQ: 'rabbitmq',
  Docker: 'docker',
  Kubernetes: 'kubernetes',
  Helm: 'helm',
  'GitHub Actions': 'githubactions',
  Prometheus: 'prometheus',
  Grafana: 'grafana',
  'JUnit 5': 'junit5',
};

export function skillLogo(skill: string): string | undefined {
  const slug = skillLogos[skill];
  return slug ? `/skills/${slug}.svg` : undefined;
}
