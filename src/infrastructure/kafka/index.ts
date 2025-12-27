import { Kafka } from 'kafkajs';
import { config } from '../../config';

export const kafka = new Kafka({
  clientId: 'herta',
  brokers: config.kafka.KAFKA_BROKERS.split(','),
});

export const producer = kafka.producer();
