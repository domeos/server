FROM private-registry.sohucs.com/sohucs/tomcat:8.0.24-jdk7 
RUN rm -r /opt/tomcat/webapps/*
COPY target/DomeOS.war /opt/tomcat/webapps/ROOT.war
CMD ["catalina.sh", "run"]
