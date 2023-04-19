import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { UsersIndicator } from './UsersIndicator';
import mdx from './UsersIndicator.mdx';

const meta: ComponentMeta<typeof UsersIndicator> = {
  title: 'General/UsersIndicator',
  component: UsersIndicator,
  argTypes: {},
  parameters: {
    docs: {
      page: mdx,
    },
    knobs: {
      disabled: true,
    },
    controls: {
      exclude: ['className', 'onClick'],
    },
    actions: {
      disabled: true,
    },
  },
  args: {
    onClick: undefined,
  },
};

export const Basic: ComponentStory<typeof UsersIndicator> = (args) => {
  const users = [
    {
      name: 'John Doe',
      avatarUrl: 'https://picsum.photos/id/1/200/200',
    },
    {
      name: 'Jane Smith',
      avatarUrl: '',
    },
    {
      name: 'Bob Johnson',
      avatarUrl: 'https://picsum.photos/id/3/200/200',
    },
  ];

  return (
    <UsersIndicator
      {...args}
      users={users.map((user) => ({ user, lastActiveAt: new Date().toDateString() }))}
      limit={4}
    />
  );
};

export const WithManyUsers: ComponentStory<typeof UsersIndicator> = (args) => {
  const users = [
    {
      name: 'John Doe',
      avatarUrl: 'https://picsum.photos/id/1/200/200',
    },
    {
      name: 'Jane Smith',
      avatarUrl: '',
    },
    {
      name: 'Bob Johnson',
      avatarUrl: 'https://picsum.photos/id/3/200/200',
    },
    {
      name: 'John Smith',
      avatarUrl: 'https://picsum.photos/id/1/200/200',
    },
    {
      name: 'Jane Johnson',
      avatarUrl: '',
    },
  ];

  return (
    <UsersIndicator
      {...args}
      users={users.map((user) => ({ user, lastActiveAt: new Date().toDateString() }))}
      limit={4}
    />
  );
};

export default meta;
