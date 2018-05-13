import {h, Component} from 'preact';
import {connect} from 'unistore/preact';

function getPercentage(numberOfVotes, totalVotes) {
	return (numberOfVotes / totalVotes * 100).toFixed(0) + '%';
}

class PollResults extends Component {
	static defaultProps = {
		pollQuestion: '',
		pollResults: {},
		totalVotes: 0
	};

	componentDidMount() {
		if (this.props.aggregateId !== this.props.id) {
			this.props.getPollById(this.props.id);
		}
	}

	render(props) {
		return (
			<section class="container">
				<h3>{props.pollQuestion}</h3>
				{Object.keys(props.pollResults).map(key => {
					const percent = getPercentage(
						props.pollResults[key],
						props.totalVotes
					);
					return (
						<div class="progress-bar horizontal rounded">
							<em>{key}</em>
							<small class="u-pull-right">
								<em>{percent}</em>
							</small>
							<div class="progress-track">
								<div class="progress-fill" style={{width: percent}} />
							</div>
						</div>
					);
				})}
				<h6 style={{textAlign: 'right'}}>
					Total Votes: <em>{props.totalVotes}</em>
				</h6>
			</section>
		);
	}
}

export default connect('aggregateId,pollQuestion,pollResults,totalVotes', {
	getPollById: 'getPollById'
})(PollResults);
