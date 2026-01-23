import { Body, Button, Container, Head, Hr, Html, Section, Text } from '@react-email/components';
import { body, button, container, footer, heading, hr, paragraph } from './styles';

interface ResetPasswordTemplateProps {
  url: string;
}

export function ResetPasswordTemplate({ url }: ResetPasswordTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Reset your password</Text>
            <Text style={paragraph}>
              Click the button below to reset your password. This link will expire in 1 hour.
            </Text>
            <Button style={button} href={url}>
              Reset Password
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn't request a password reset, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
