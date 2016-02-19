package org.domeos.client.kubernetesclient.definitions.v1;
/**
 * Created by anningluo on 2015-12-02.
*/
// ExecAction
// ==========
// Description:
// 	ExecAction describes a "run in container" action.
// Variables:
// 	Name   	Required                                                                                                                                                       	Schema	Default     
// 	=======	===============================================================================================================================================================	======	============
// 	command	',
/*
etc) won’t work. To use a shell, you need to explicitly call out to that
 shell. Exit status of 0 is treated as live/healthy and non-zero is 
unhealthy.	boolean 	string array
*/
public class ExecAction {
	// Command is the command line to execute inside the container, the
	// working directory for the command is root ( / ) in the container’s
	// filesystem. The command is simply exec’d, it is not run inside a shell,
	// so traditional shell instructions ('
	private String[] command;

	public ExecAction() {
	}
	// for command
	public String[] getCommand() {
		return command;
	}
	public void setCommand(String[] command) {
		this.command = command;
	}
	public ExecAction putCommand(String[] command) {
		this.command = command;
		return this;
	}

	public String formatLikeYaml(String prefix, String unitPrefix, String firstLinePrefix) {
		String tmpStr = "";
        tmpStr += firstLinePrefix + "command: ";
		for (String oneCommand : command) {
			tmpStr += "\n" + firstLinePrefix + "- " + oneCommand;
		}
		return tmpStr + "\n";
	}



	public String toString() {
		return this.formatLikeYaml("", "\t", "");
	}

}