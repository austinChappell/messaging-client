const helpers = {
  getUnread: (users, user) => {
    return users.messages.filter(m => !m.read && m.recipient_id === user.id);
  },

  searchMessages: (users, searchValue) => {
    const downCaseVal = searchValue.toLowerCase();

    const results = users.filter(user => {
      const name = `${user.first_name} ${user.last_name}`.toLowerCase();
      const messages = user.messages.map(m => m.content.toLowerCase());
      const filteredMessages = messages.filter(m => {
        return m.indexOf(downCaseVal) > -1;
      });
      return name.indexOf(downCaseVal) > -1 || filteredMessages.length > 0;
    })

    return results;
  },

  truncate: (str, length) => {
    if (str.length > length) {
      return `${str.substring(0, length)}...`
    }
    return str;
  }
}

export default helpers;
