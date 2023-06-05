const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const generateCode = require('../utils/generateCode.js');

const taskSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        default: () => generateCode('task')
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['assignment', 'issue'],
        required: true,
        default: 'assignment'
    },
    priority: {
        type: String,
        enum: ['highest', 'high', 'medium', 'low', 'lowest'],
        required: true
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    endDate: Date,
    description: String,
    status: {
        type: String,
        enum: ['open', 'inprogress', 'review', 'reopen', 'done', 'cancel'],
        required: true,
        default: 'open'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comments'
    }],
    activities: [{
        type: Schema.Types.ObjectId,
        ref: 'Activities'
    }]
});

taskSchema.pre('save', (next) => {
    if (!this.code) {
        this.code = generateCode('task');
    }
    next();
})

const Tasks = mongoose.model('Tasks', taskSchema);

module.exports = Tasks;