package org.domeos.framework.api.service.alarm.impl;

/**
 * Created by baokangwang on 2016/5/6.
 */

import java.util.Date;
import java.util.Properties;
import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import org.apache.log4j.Logger;

public class MailSender {

    private String host = null;
    private String fromAddr = "=?UTF-8?B?5pCc54uQ5LqR5pyN5Yqh?= <sohucloud@sohu.com>"; // base64 of 搜狐云服务
    private Session session = null;
    private static Logger logger = Logger.getLogger(MailSender.class);

    public MailSender(String host)
    {
        this.host = host;
        Properties props = System.getProperties();
        props.put("mail.mime.charset", "UTF-8");
        props.put("mail.smtp.localhost", "localhost");
        if (this.host != null)
        {
            props.put("mail.smtp.host", this.host);
        }

        props.put("mail.smtp.auth", "true");
        MyAuthenticator myauth = new MyAuthenticator("postmaster@rdc.sendcloud.org", "jqsTuwfT");
        session = Session.getDefaultInstance(props, myauth);
    }

    public void sendMail(String toAddrs, String subject, String content)
    {
        try
        {
            MimeBodyPart text = new MimeBodyPart();
            text.setContent(content, "text/html;charset=UTF-8");
            MimeMultipart multipart = new MimeMultipart();
            multipart.addBodyPart(text);

            sendMail(toAddrs, subject, multipart);
        }
        catch (Exception e)
        {
            logger.error("Send text mail Error! error=" + e);
        }
    }

    public void sendMail(String toAddrs, String subject, MimeMultipart content)
    {
        try
        {
            if (toAddrs.isEmpty()) {
                logger.info("send mail to nowhere.");
                return;
            }
            MimeMessage mm = new MimeMessage(session);
            mm.setFrom(new InternetAddress(fromAddr));
            String[] list = toAddrs.split(",");

            InternetAddress[] receivers = new InternetAddress[list.length];
            for (int i = 0; i < list.length; i++)
            {
                receivers[i] = new InternetAddress(list[i]);
            }
            mm.setRecipients(Message.RecipientType.TO, receivers);
            mm.setSubject(subject);
            mm.setSentDate(new Date());
            mm.setContent(content);

            Transport.send(mm);
            logger.info("send mail to [" + toAddrs + "] OK!");
        }
        catch (Exception e)
        {
            logger.error("send mail to [" + toAddrs + "] Error! error=" + e);
        }
    }
}


class MyAuthenticator extends Authenticator
{
    private String user;
    private String pwd;

    public MyAuthenticator(String user, String pwd)
    {
        this.user = user;
        this.pwd = pwd;
    }

    protected PasswordAuthentication getPasswordAuthentication()
    {
        return new PasswordAuthentication(user, pwd);
    }
}