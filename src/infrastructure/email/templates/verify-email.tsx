import { Body, Button, Container, Head, Hr, Html, Section, Text } from '@react-email/components';
import { body, button, container, footer, heading, hr, paragraph } from './styles';

interface VerifyEmailTemplateProps {
  url: string;
}

export function VerifyEmailTemplate({ url }: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Verify your email</Text>
            <Text style={paragraph}>Click the button below to verify your email address.</Text>
            <Button style={button} href={url}>
              Verify Email
            </Button>
            <Hr style={hr} />
            <Text style={footer}>If you didn't request this email, you can safely ignore it.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
