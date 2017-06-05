class DefaultMailSender {
    public Object send(String number, String subject, String content) throws Exception {
        return ["fromAddr": "domeos@sohu-inc.com",
                "host": "transport.mail.sohu-inc.com",
                "number": number,
                "subject": subject,
                "content": content]
    }

    public Object send() throws Exception {
        return ["fromAddr": "domeos@sohu-inc.com",
                "host": "transport.mail.sohu-inc.com"]
    }
}