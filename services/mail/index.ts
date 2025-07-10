import { type Transporter } from "nodemailer";
import mjml2html from "mjml";
import { to } from "await-to-ts";

interface IMailServer {
  sendVerificationEmail({
    recipient,
    tokenUrl,
  }: {
    recipient: string;
    tokenUrl: string;
  }): Promise<boolean>;
}

export class MailServer implements IMailServer {
  #transporter: Transporter;
  constructor(transporter: Transporter) {
    this.#transporter = transporter;
  }
  sendVerificationEmail = async ({
    recipient,
    tokenUrl,
  }: {
    recipient: string;
    tokenUrl: string;
  }): Promise<boolean> => {
    const [error, response] = await to(
      this.#transporter.sendMail({
        to: recipient,
        subject: "Email Verification",
        html: mjml2html(`
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                  <mj-text>
                    Please verify your email by clicking the link below:
                  </mj-text>
                  <mj-button href="${tokenUrl}">
                    Verify Email
                  </mj-button>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `).html,
      }),
    );
    if (error) {
      console.error("Failed to send verification email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    return response;
  };
}
