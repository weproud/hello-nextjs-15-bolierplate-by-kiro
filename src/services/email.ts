/**
 * Email Service
 *
 * Email sending utilities and templates for
 * transactional emails in the application.
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('email-service')

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<void>
}

/**
 * Console email provider (for development)
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    logger.info('Email would be sent', {
      to: options.to,
      subject: options.subject,
      html: options.html ? 'HTML content provided' : 'No HTML content',
      text: options.text ? 'Text content provided' : 'No text content',
      from: options.from,
      replyTo: options.replyTo,
      attachments: options.attachments?.length || 0,
    })
  }
}

/**
 * SMTP email provider
 */
export class SMTPEmailProvider implements EmailProvider {
  private host: string
  private port: number
  private user: string
  private pass: string

  constructor(config: {
    host: string
    port: number
    user: string
    pass: string
  }) {
    this.host = config.host
    this.port = config.port
    this.user = config.user
    this.pass = config.pass
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      // SMTP 구현 (실제 환경에서는 nodemailer 등을 사용)
      logger.info('Sending email via SMTP', {
        host: this.host,
        port: this.port,
        to: options.to,
        subject: options.subject,
      })

      // 실제 SMTP 전송 로직 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))

      logger.info('Email sent successfully via SMTP')
    } catch (error) {
      logger.error('Failed to send email via SMTP', error as Error, {
        host: this.host,
        to: options.to,
      })
      throw new Error('SMTP 이메일 전송에 실패했습니다.')
    }
  }
}

/**
 * SendGrid email provider
 */
export class SendGridEmailProvider implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      logger.info('Sending email via SendGrid', {
        to: options.to,
        subject: options.subject,
      })

      // SendGrid API 호출 시뮬레이션
      // 실제 환경에서는 @sendgrid/mail 패키지를 사용
      const payload = {
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: {
          email:
            options.from || process.env['FROM_EMAIL'] || 'noreply@example.com',
        },
        content: [
          ...(options.text
            ? [{ type: 'text/plain', value: options.text }]
            : []),
          ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
        ],
        ...(options.replyTo && { reply_to: { email: options.replyTo } }),
        ...(options.attachments && {
          attachments: options.attachments.map(att => ({
            content:
              typeof att.content === 'string'
                ? att.content
                : att.content.toString('base64'),
            filename: att.filename,
            type: att.contentType || 'application/octet-stream',
            disposition: 'attachment',
          })),
        }),
      }

      // 실제 SendGrid API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800))

      logger.info('Email sent successfully via SendGrid')
    } catch (error) {
      logger.error('Failed to send email via SendGrid', error as Error, {
        to: options.to,
      })
      throw new Error('SendGrid 이메일 전송에 실패했습니다.')
    }
  }
}

// Email provider factory function
function createEmailProvider(): EmailProvider {
  const emailType = process.env['EMAIL_PROVIDER'] || 'console'

  switch (emailType.toLowerCase()) {
    case 'smtp':
      if (
        !process.env['SMTP_HOST'] ||
        !process.env['SMTP_PORT'] ||
        !process.env['SMTP_USER'] ||
        !process.env['SMTP_PASS']
      ) {
        logger.warn(
          'SMTP configuration incomplete, falling back to console provider'
        )
        return new ConsoleEmailProvider()
      }
      return new SMTPEmailProvider({
        host: process.env['SMTP_HOST']!,
        port: parseInt(process.env['SMTP_PORT']!, 10),
        user: process.env['SMTP_USER']!,
        pass: process.env['SMTP_PASS']!,
      })

    case 'sendgrid':
      if (!process.env['SENDGRID_API_KEY']) {
        logger.warn(
          'SendGrid API key not found, falling back to console provider'
        )
        return new ConsoleEmailProvider()
      }
      return new SendGridEmailProvider(process.env['SENDGRID_API_KEY']!)

    case 'console':
    default:
      return new ConsoleEmailProvider()
  }
}

// Default email provider
export const emailProvider: EmailProvider = createEmailProvider()

/**
 * Email templates
 */
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: '환영합니다!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">환영합니다, ${name}님!</h1>
        <p>저희 서비스에 가입해 주셔서 감사합니다.</p>
        <p>이제 프로젝트를 생성하고 관리할 수 있습니다.</p>
        <a href="${process.env['NEXTAUTH_URL']}/dashboard" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          대시보드로 이동
        </a>
      </div>
    `,
    text: `환영합니다, ${name}님! 저희 서비스에 가입해 주셔서 감사합니다.`,
  }),

  projectCreated: (projectTitle: string, userName: string): EmailTemplate => ({
    subject: `새 프로젝트 "${projectTitle}"가 생성되었습니다`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">프로젝트가 생성되었습니다</h1>
        <p>안녕하세요, ${userName}님!</p>
        <p>새 프로젝트 "<strong>${projectTitle}</strong>"가 성공적으로 생성되었습니다.</p>
        <p>프로젝트 관리를 시작해보세요.</p>
        <a href="${process.env['NEXTAUTH_URL']}/projects" 
           style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          프로젝트 보기
        </a>
      </div>
    `,
    text: `새 프로젝트 "${projectTitle}"가 생성되었습니다.`,
  }),

  passwordReset: (resetLink: string, userName: string): EmailTemplate => ({
    subject: '비밀번호 재설정 요청',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">비밀번호 재설정</h1>
        <p>안녕하세요, ${userName}님!</p>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 링크를 클릭하여 새 비밀번호를 설정하세요:</p>
        <a href="${resetLink}" 
           style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          비밀번호 재설정
        </a>
        <p><small>이 링크는 24시간 후에 만료됩니다.</small></p>
        <p><small>요청하지 않으셨다면 이 이메일을 무시하세요.</small></p>
      </div>
    `,
    text: `비밀번호 재설정 링크: ${resetLink}`,
  }),

  contactForm: (data: {
    name: string
    email: string
    subject: string
    message: string
  }): EmailTemplate => ({
    subject: `문의: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">새 문의가 접수되었습니다</h1>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>이름:</strong> ${data.name}</p>
          <p><strong>이메일:</strong> ${data.email}</p>
          <p><strong>제목:</strong> ${data.subject}</p>
          <p><strong>메시지:</strong></p>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
    `,
    text: `새 문의 - ${data.subject}\n\n이름: ${data.name}\n이메일: ${data.email}\n\n메시지:\n${data.message}`,
  }),

  newsletterConfirmation: (email: string): EmailTemplate => ({
    subject: '뉴스레터 구독 확인',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">뉴스레터 구독 확인</h1>
        <p>안녕하세요!</p>
        <p>뉴스레터 구독을 확인해 주셔서 감사합니다.</p>
        <p>앞으로 유용한 정보와 업데이트를 정기적으로 보내드리겠습니다.</p>
        <p><small>구독을 취소하려면 이메일 하단의 구독 취소 링크를 클릭하세요.</small></p>
      </div>
    `,
    text: '뉴스레터 구독이 확인되었습니다. 감사합니다!',
  }),
}

/**
 * Email service functions
 */
export const emailService = {
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, name: string) {
    const template = emailTemplates.welcome(name)
    await emailProvider.send({
      to,
      ...template,
    })
  },

  /**
   * Send project creation notification
   */
  async sendProjectCreatedEmail(
    to: string,
    projectTitle: string,
    userName: string
  ) {
    const template = emailTemplates.projectCreated(projectTitle, userName)
    await emailProvider.send({
      to,
      ...template,
    })
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    userName: string
  ) {
    const template = emailTemplates.passwordReset(resetLink, userName)
    await emailProvider.send({
      to,
      ...template,
    })
  },

  /**
   * Send contact form notification
   */
  async sendContactFormEmail(
    to: string,
    data: { name: string; email: string; subject: string; message: string }
  ) {
    const template = emailTemplates.contactForm(data)
    await emailProvider.send({
      to,
      ...template,
    })
  },

  /**
   * Send newsletter confirmation
   */
  async sendNewsletterConfirmation(to: string) {
    const template = emailTemplates.newsletterConfirmation(to)
    await emailProvider.send({
      to,
      ...template,
    })
  },

  /**
   * Send custom email
   */
  async sendCustomEmail(options: EmailOptions) {
    await emailProvider.send(options)
  },
}
