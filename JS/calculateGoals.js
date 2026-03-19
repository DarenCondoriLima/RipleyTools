const GOALS_STORAGE_KEY = 'goalsFormData';

function saveGoalsFormData(formData) {
	localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(formData));
}

function loadGoalsFormData() {
	const savedData = localStorage.getItem(GOALS_STORAGE_KEY);

	if (!savedData) {
		return null;
	}

	try {
		return JSON.parse(savedData);
	} catch (error) {
		return null;
	}
}

function renderGoalResults(resultContainer, formData) {
	const goal95 = formData.monthGoal * 0.95;
	const goal100 = formData.monthGoal;
	const goal105 = formData.monthGoal * 1.05;
	const goal110 = formData.monthGoal * 1.1;
	const goal125 = formData.monthGoal * 1.25;
	const goal140 = formData.monthGoal * 1.4;
	const percentageOfCompletion = goal100 === 0 ? 0 : (formData.progressTowardTheGoal * 100) / goal100;
	const divisor = formData.daysRemaining > 0 ? formData.daysRemaining : 1;
	const dailySalesFor95 = (goal95 - formData.progressTowardTheGoal) / divisor;
	const dailySalesFor100 = (goal100 - formData.progressTowardTheGoal) / divisor;
	const dailySalesFor105 = (goal105 - formData.progressTowardTheGoal) / divisor;
	const dailySalesFor110 = (goal110 - formData.progressTowardTheGoal) / divisor;
	const dailySalesFor125 = (goal125 - formData.progressTowardTheGoal) / divisor;
	const dailySalesFor140 = (goal140 - formData.progressTowardTheGoal) / divisor;
	const progressBarValue = Math.max(0, Math.min(100, percentageOfCompletion));

	resultContainer.innerHTML = `
		<div class="result-header">
			<div class="result-kpi">
				<span class="kpi-label">Cumplimiento</span>
				<strong class="kpi-value">${percentageOfCompletion.toFixed(2)}%</strong>
			</div>
			<div class="result-kpi">
				<span class="kpi-label">Meta mensual</span>
				<strong class="kpi-value">${formData.monthGoal.toFixed(2)}</strong>
			</div>
			<div class="result-kpi">
				<span class="kpi-label">Avance actual</span>
				<strong class="kpi-value">${formData.progressTowardTheGoal.toFixed(2)}</strong>
			</div>
		</div>

		<div class="progress-wrap" aria-label="Progreso de cumplimiento">
			<div class="progress-track">
				<div class="progress-fill" style="width: ${progressBarValue.toFixed(2)}%;"></div>
			</div>
			<span class="progress-text">${progressBarValue.toFixed(2)}%</span>
		</div>

		<div class="result-meta">
			<p><strong>Dias laborables:</strong> ${formData.weekdays}</p>
			<p><strong>Dias restantes:</strong> ${formData.daysRemaining}</p>
		</div>

		<div class="targets-grid">
			<article class="target-card">
				<h3>95%</h3>
				<p>Venta diaria: <strong>${dailySalesFor95.toFixed(2)}</strong></p>
			</article>
			<article class="target-card">
				<h3>100%</h3>
				<p>Venta diaria: <strong>${dailySalesFor100.toFixed(2)}</strong></p>
			</article>
			<article class="target-card">
				<h3>105%</h3>
				<p>Venta diaria: <strong>${dailySalesFor105.toFixed(2)}</strong></p>
			</article>
			<article class="target-card">
				<h3>110%</h3>
				<p>Venta diaria: <strong>${dailySalesFor110.toFixed(2)}</strong></p>
			</article>
			<article class="target-card">
				<h3>125%</h3>
				<p>Venta diaria: <strong>${dailySalesFor125.toFixed(2)}</strong></p>
			</article>
			<article class="target-card">
				<h3>140%</h3>
				<p>Venta diaria: <strong>${dailySalesFor140.toFixed(2)}</strong></p>
			</article>
		</div>
	`;
}

document.addEventListener('DOMContentLoaded', () => {
	const goalsForm = document.querySelector('.goalsForm');
	const resultContainer = document.querySelector('.result');
	const monthGoalInput = document.getElementById('monthGoal');
	const weekdaysInput = document.getElementById('Weekdays');
	const progressInput = document.getElementById('ProgressTowardTheGoal');
	const daysRemainingInput = document.getElementById('daysRemaining');

	if (!goalsForm || !monthGoalInput || !weekdaysInput || !progressInput || !daysRemainingInput) {
		return;
	}

	const savedFormData = loadGoalsFormData();

	if (savedFormData) {
		monthGoalInput.value = savedFormData.monthGoal ?? '';
		weekdaysInput.value = savedFormData.weekdays ?? '';
		progressInput.value = savedFormData.progressTowardTheGoal ?? '';
		daysRemainingInput.value = savedFormData.daysRemaining ?? '';

		if (resultContainer) {
			renderGoalResults(resultContainer, savedFormData);
		}
	}

	goalsForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const formData = {
			monthGoal: Number(monthGoalInput.value),
			weekdays: Number(weekdaysInput.value),
			progressTowardTheGoal: Number(progressInput.value),
			daysRemaining: Number(daysRemainingInput.value)
		};

		saveGoalsFormData(formData);
		console.log('Datos capturados de goalsForm:', formData);

		if (resultContainer) {
			renderGoalResults(resultContainer, formData);
		}
	});
});
