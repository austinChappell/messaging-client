const helpers = {
  searchMessages: (users, searchValue) => {
    const downCaseVal = searchValue.toLowerCase();

    const results = users.filter((user) => {
      const name = `${user.first_name} ${user.last_name}`.toLowerCase();
      const messages = user.messages.map(m => m.content.toLowerCase());
      const filteredMessages = messages.filter(m => m.indexOf(downCaseVal) > -1);
      return name.indexOf(downCaseVal) > -1 || filteredMessages.length > 0;
    });

    return results;
  },

  sortByLatestMessage: (users) => {
    // using object.assign instead of spread operator
    // cypress.io lacks support for object spread operator
    const mapped = users.map(u => (Object.assign({}, u)));
    return mapped.sort((a, b) => {
      const aLast = a.last_message ? new Date(a.last_message.timestamp) : null;
      const bLast = b.last_message ? new Date(b.last_message.timestamp) : null;
      if (aLast > bLast) {
        return -1;
      } if (aLast < bLast) {
        return 1;
      }
      return 0;
    });
  },

  truncate: (str, length) => {
    if (str.length > length) {
      return `${str.substring(0, length)}...`;
    }
    return str;
  },
};

export default helpers;
