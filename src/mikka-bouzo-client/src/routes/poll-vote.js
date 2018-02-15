import {h, Component} from 'preact';
import {route} from 'preact-router';
import {connect} from 'unistore/preact';

class PollVote extends Component {
	static defaultProps = {
		multiSelect: false,
		pollQuestion: '',
		pollOptions: []
	};

	state = {
		selectedOptions: {}
	};

	togglePollOptionSelected = option => () => {
		const {props, state: {selectedOptions}} = this;
		const updates = {};
		updates[option] = !selectedOptions[option];
		this.setState({
			selectedOptions: props.multiSelect
				? {...selectedOptions, ...updates}
				: updates
		});
	};

	submitVote = () => {
		const {props, state: {selectedOptions}} = this;
		props.submitVote({
			aggregateId: props.id,
			selectedOptions: Object.keys(selectedOptions).reduce((acc, key) => {
				return acc.concat(selectedOptions[key] ? key : []);
			}, [])
		});
	};

	viewResults = () => {
		route(`/poll/${this.props.id}/results`);
	};

	componentDidMount() {
		if (this.props.aggregateId !== this.props.id) {
			this.props.getPollById(this.props.id);
		}
	}

	render(props, state) {
		console.log(props)
		return (
			<section class="container">
				<h3 style={{textAlign: 'center'}}>{props.pollQuestion}</h3>
				{props.pollOptions.map(option => (
					<label style={{fontWeight: '400'}} class="control control--checkbox">
						{option}
						<input
							type="checkbox"
							checked={!!state.selectedOptions[option]}
							onClick={this.togglePollOptionSelected(option)}
						/>
						<div class="control__indicator" />
					</label>
				))}
				<hr />
				<button
					style={{fontSize: 'small', margin: '0 .5rem'}}
					class="button-primary u-pull-right"
					onClick={this.submitVote}
				>
					Vote
				</button>
				<a
					style={{
						cursor: 'pointer',
						lineHeight: '44px',
						padding: '0 3rem'
					}}
					class="u-pull-right"
					onClick={this.viewResults}
				>
					View Results
				</a>
			</section>
		);
	}
}

export default connect('aggregateId,busy,pollQuestion,pollOptions', {
	getPollById: 'getPollById',
	submitVote: 'submitVote'
})(PollVote);
