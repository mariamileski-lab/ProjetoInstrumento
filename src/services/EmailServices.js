let nodemailer = null;

try {
    nodemailer = require('nodemailer');
} catch (error) {
    nodemailer = null;
}

class EmailServices {
    constructor() {
        this.transportador = null;
    }

    criarTransportador() {
        if (!nodemailer) {
            return null;
        }

        if (this.transportador) {
            return this.transportador;
        }

        const {
            EMAIL_HOST,
            EMAIL_PORT,
            EMAIL_SECURE,
            EMAIL_USER,
            EMAIL_PASS
        } = process.env;

        if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
            return null;
        }

        this.transportador = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: Number(EMAIL_PORT),
            secure: EMAIL_SECURE === 'true',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        return this.transportador;
    }

    async enviarEmail({ para, assunto, texto, html }) {
        if (!para) {
            return {
                enviado: false,
                motivo: 'Destinatario nao informado'
            };
        }

        const transportador = this.criarTransportador();

        if (!transportador) {
            console.log('Email nao enviado. Configure nodemailer e as variaveis EMAIL_HOST, EMAIL_PORT, EMAIL_USER e EMAIL_PASS.');
            console.log({ para, assunto, texto });

            return {
                enviado: false,
                motivo: 'Servico de email nao configurado'
            };
        }

        await transportador.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: para,
            subject: assunto,
            text: texto,
            html
        });

        return {
            enviado: true
        };
    }

    async enviarStatusCompra(compra) {
        if (!compra.email_usuario) {
            return {
                enviado: false,
                motivo: 'Compra sem email de usuario'
            };
        }

        const statusTexto = {
            pendente: 'pendente de aprovacao',
            aprovado: 'aprovada',
            reprovado: 'reprovada'
        }[compra.status] || compra.status;

        const assunto = `Compra #${compra.id_compra} ${statusTexto}`;
        const texto = [
            `Ola, ${compra.nome_usuario || 'cliente'}.`,
            `Sua compra #${compra.id_compra} esta ${statusTexto}.`,
            `Produto: ${compra.nome_produto || compra.id_produto}`,
            `Quantidade: ${compra.quantidade}`,
            `Valor total: R$ ${Number(compra.valor_total).toFixed(2)}`
        ].join('\n');

        return this.enviarEmail({
            para: compra.email_usuario,
            assunto,
            texto,
            html: `<p>Ola, ${compra.nome_usuario || 'cliente'}.</p>
                <p>Sua compra <strong>#${compra.id_compra}</strong> esta <strong>${statusTexto}</strong>.</p>
                <p>Produto: ${compra.nome_produto || compra.id_produto}</p>
                <p>Quantidade: ${compra.quantidade}</p>
                <p>Valor total: R$ ${Number(compra.valor_total).toFixed(2)}</p>`
        });
    }
}

module.exports = new EmailServices();
