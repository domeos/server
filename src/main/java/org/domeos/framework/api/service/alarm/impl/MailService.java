package org.domeos.framework.api.service.alarm.impl;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.util.Date;
import java.util.Properties;

/**
 * Created by feiliu206363 on 2017/2/23.
 */
public class MailService {
    public static boolean send(String host, String fromAddr, String toAddrs, String subject, String content) throws MessagingException {
        Properties props = System.getProperties();
        props.put("mail.mime.charset", "UTF-8");
        props.put("mail.smtp.host", host);
        Session session = Session.getDefaultInstance(props);
        MimeBodyPart text = new MimeBodyPart();
        MimeMultipart multipart = new MimeMultipart();
        try {
            text.setContent(content, "text/html;charset=UTF-8");
            multipart.addBodyPart(text);
        } catch (MessagingException e) {
            return false;
        }
        if (toAddrs.isEmpty()) {
            return true;
        }
        MimeMessage mm = new MimeMessage(session);
        mm.setFrom(new InternetAddress(fromAddr));
        String[] list = toAddrs.split(",");

        InternetAddress[] receivers = new InternetAddress[list.length];
        for (int i = 0; i < list.length; i++) {
            receivers[i] = new InternetAddress(list[i]);
        }
        mm.setRecipients(Message.RecipientType.TO, receivers);
        mm.setSubject(subject);
        mm.setSentDate(new Date());
        mm.setContent(multipart);

        Transport.send(mm);
        return true;
    }
}
