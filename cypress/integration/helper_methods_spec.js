import moment from 'moment';
import helpers from '../../src/helpers';

const {
  searchMessages,
  sortByLatestMessage,
  truncate,
} = helpers;

const today = moment();
const yesterday = moment().subtract(1, 'day');

const users = [
  {
    first_name: 'Andy',
    last_name: 'Smith',
    messages: [
      { content: 'Hello, this is Andy.' },
      { content: 'Hello, Andy' },
      { content: 'Hey Ryan' },
    ],
    last_message: {
      timestamp: yesterday,
    },
  },
  {
    first_name: 'Ryan',
    last_name: 'Jones',
    messages: [
      { content: 'Hello' },
      { content: 'Yo' },
      { content: 'Hey Ryan' },
    ],
    last_message: {
      timestamp: today,
    },
  },
];

describe('Helper Methods', () => {
  it('can truncate a string', () => {
    const input = 'This is a string that will become truncated after it is passed through the method.';
    const output = truncate(input, 20);
    const expectedOutput = 'This is a string tha...';
    expect(output).to.eq(expectedOutput);
  });

  it('can search and filter messages by name', () => {
    const output = searchMessages(users, 'andy');
    expect(output.length).to.eq(1);
  });

  it('can search and filter messages by content', () => {
    const output = searchMessages(users, 'hello, this is andy');
    expect(output.length).to.eq(1);
  });

  it('can search and filter message by name and content', () => {
    const output = searchMessages(users, 'RyAn');
    expect(output.length).to.eq(2);
  });

  it('can sort users by latest message', () => {
    const output = sortByLatestMessage(users);
    const firstUser = output[0];
    expect(firstUser.first_name).to.eq('Ryan');
  });
});
