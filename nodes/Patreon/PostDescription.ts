import type { INodeProperties } from 'n8n-workflow';

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get_post',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
		options: [
			{
				name: 'Get a Post',
				value: 'get_post',
				action: 'Get a post',
			},
			{
				name: 'Get All Posts',
				value: 'get_all_posts',
				description: 'Get all campaign posts',
				action: 'Get all campaign posts',
			},
		],
	},
];

export const postFields: INodeProperties[] = [
	{
		displayName: 'Post ID',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get_post'],
				resource: ['post'],
			},
		},
		default: '',
		required: true,
		description: 'Patreon post ID',
	},
	{
		displayName: 'Campaign ID',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get_all_posts'],
				resource: ['post'],
			},
		},
		default: '',
		required: true,
		description: 'Patreon campaign ID',
	},
];
