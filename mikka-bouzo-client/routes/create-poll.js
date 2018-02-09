import {h, Component} from 'preact';
import {route} from 'preact-router';
import {connect} from 'unistore/preact';

class CreatePoll extends Component {
	state = {
		pollQuestion: '',
		pollOptions: ['', '', '']
	};

	updatePollQuestion = event => {
		this.setState({pollQuestion: event.target.value});
	};

	updatePollOptions = index => event => {
		this.setState({
			pollOptions: [
				...this.state.pollOptions.slice(0, index),
				event.target.value,
				...this.state.pollOptions.slice(index + 1)
			]
		});
	};

	addNewPollOption = _ => {
		this.setState({pollOptions: this.state.pollOptions.concat('')});
	};

	createPoll = _ => {
		try {
			const {props, state} = this;
			props.createPoll(state);
			// navigate to poll results for given id
		} catch (err) {
			// TODO: Display error to user
			console.error('main thread catch hit: ', err);
		}
	};

	componentWillReceiveProps(nextProps) {
		if (this.props.aggregateId === null && nextProps.aggregateId) {
			route(`/poll/${nextProps.aggregateId}/results`);
		}
	}

	render(props, state) {
		return (
			<section class="container">
				<h2 style={{textAlign: 'center'}}>Mikka Bouzo</h2>
				<input
					type="text"
					class="u-full-width"
					style={{fontSize: '2.5rem', height: '5rem'}}
					placeholder="Type the poll question here..."
					value={state.pollQuestion}
					onInput={this.updatePollQuestion}
				/>
				{state.pollOptions.map((option, i) => (
					<div>
						<span style={{paddingTop: '1rem', position: 'absolute'}}>
							{i + 1}.
						</span>
						<input
							type="text"
							class="u-full-width"
							style={{
								borderRadius: '0',
								borderWidth: '0 0 1px 0',
								paddingLeft: '2rem'
							}}
							value={option}
							placeholder="poll option..."
							onInput={this.updatePollOptions(i)}
						/>
					</div>
				))}
				<a style={{cursor: 'pointer'}} onClick={this.addNewPollOption}>
					Add new poll option
				</a>
				<button onClick={this.createPoll} class="button-primary u-pull-right">
					Create Poll
				</button>
			</section>
		);
	}
}

export default connect('saving,aggregateId', {
	createPoll: 'createPoll'
})(CreatePoll);