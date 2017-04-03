module.exports = async function({options}){
  return async (req, res) => {

    // NOTE: NETSEC: this function requires authentication (forced by netsec middleware).
    const _id = req.state.model.user._id;

    // NOTE: NETSEC: these have already been validated by the security middleware.
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
