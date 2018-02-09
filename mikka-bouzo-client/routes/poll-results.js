import {h, Component} from 'preact';
import {connect} from 'unistore/preact';

const getPercentage = (numberOfVotes, totalVotes) => {
	return (numberOfVotes / totalVotes * 100).toFixed(0) + '%';
};

class PollResults extends Component {
	static defaultProps = {
		pollQuestion: '',
		pollResults: {},
		totalVotes: 0
	};

	render(props, state) {
		console.log(props);
		return (
			<section class="container">
				<h3>{props.pollQuestion}</h3>
				{Object.values(props.pollResults).map(answer => {
					const percent = getPercentage(answer.numberOfVotes, props.totalVotes);
					return (
						<div class="progress-bar horizontal rounded">
							<em>{answer.value}</em>
							<div class="progress-track">
								<div class="progress-fill" style={{width: percent}}>
									<span>{percent}</span>
								</div>
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

export default connect('pollQuestion,pollResults,totalVotes')(PollResults);
