module.exports = async function({options}){

  return async (req, res) => {

    const _id = req.state.model.user._id;
    let updateData = {};

    // NOTE: This is tainted and requires validation.
    const supportSubject = req.body.subject;
    const supportMessage = req.body.message;

    // TODO: send message...

    // log the sending of a message.
    let user = await req.userManager.userGet(_id);
    user.notes.push( `${new Date()}: Sent message (${(supportSubject+supportMessage).length} bytes).` );
    await req.userManager.userMod(_id, user);

    return res.redirect(this.options.links.user);

  }

}
