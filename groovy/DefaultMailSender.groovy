class DefaultMailSender {
    public Object send(String number, String subject, String content) throws Exception {
        return ["fromAddr": "domeos@sohu-inc.com",
                "host": "mail.sohu.com",
                "number": number,
                "subject": subject,
                "content": content]
    }
}