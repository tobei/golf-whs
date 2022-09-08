
function round_number(number, decimals) {
    const multiplier = 10 ** decimals;
    return Math.round(number * multiplier) / multiplier;
}

class Tee {

    constructor(holes) {
        this._holes = holes;
    }

    slope(slope) {
        if (this._slope)  throw "immutable";
        this._slope = slope;
        return this;
    }

    rating9(rating9) {
        if (this._rating18)  throw "immutable";
        if (this._holes == 18) throw "9-holes property for a 18-holes";
        this._rating18 = 2 * rating9;
        return this;
    }

    rating18(rating18) {
        if (this._rating18)  throw "immutable";
        this._rating18 = rating18;
        return this;
    }

    par9(par9) {
        if (this._par18)  throw "immutable";
        if (this._holes == 18) throw "9-holes property for a 18-holes";
        this._par18 = 2 * par9;
        return this;
    }

    par18(par18) {
        if (this._par18)  throw "immutable";
        if (this._holes == 9) throw "18-holes property for a 9-holes";
        this._par18 = par18;
        return this;
    }

    man() {
        if (this._gender) throw "immutable";
        this._gender = 'm';
        return this;
    }

    lady() {
        if (this._gender) throw "immutable";
        this._gender = 'f';
        return this;
    }

    pars(...info) {
        if (info.length != this._holes) throw "incorrect length";
        this._pars = info;
        return this;
    }

    stroke_indexes(...info) {
        if (info.length != this._holes) throw "incorrect length";
        this._stroke_indexes = info;
        return this;
    }

    course_handicap(player) {
        const course_handicap18 = player._index * this._slope / 113.0 + (this._rating18 - this._par18);
        return this._holes == 18 ? round_number(course_handicap18, 0) : round_number(course_handicap18 / 2.0, 0);
    }

}

class Round {

    with(player) {
        this._player = player;
        return this;
    }

    on(tee) {
        this._tee = tee;
        return this;
    }

    course_handicap() {
        return this._tee.course_handicap(this._player);
    }

    _hole_multiplier() {
        return 18 / this._tee._holes;
    }

    _score_differential(played_course_handicap18) {
        const score_differential = round_number((played_course_handicap18 - (this._tee._rating18 - this._tee._par18)) * 113.0 / this._tee._slope, 1);
        return {
            course_handicap_played : played_course_handicap18 / this._hole_multiplier(),
            score_differential : score_differential
        }
    }

    _stroke_allocation() {

        const true_order = () => {
            if (this._tee._holes == 9 && this._tee._stroke_indexes.some(stroke_index => stroke_index > 9)) {
                return this._tee._stroke_indexes.map(stroke_index => Math.round(stroke_index / 2.0));
            } else {
                return this._tee._stroke_indexes;
            }
        }

        const stroke_indexes = true_order();
        const course_handicap = this.course_handicap();
        const general_allocation = Math.floor(course_handicap / this._tee._holes);
        const extra_allocation_treshold = course_handicap % this._tee._holes;

        return stroke_indexes.map(stroke_index => {
            return stroke_index <= extra_allocation_treshold ? general_allocation + 1 : general_allocation;
        });

    }

    stableford(score) {
        const score18 = this._tee._holes == 18 ? score : score + 17;
        const played_course_handicap18 = this.course_handicap() * this._hole_multiplier() - (score18 - 36);
        return this._score_differential(played_course_handicap18);
    }

    gross_adjusted(score) {
        const score18 = this._tee._holes == 18 ? score : score + this._tee._par18 / 2.0 + this.course_handicap() + 1;
        const played_course_handicap18 = score18 - this._tee._par18;
        return this._score_differential(played_course_handicap18);
    }

    strokes(...info) {
        if (info.length != this._tee._holes) throw "incorrect length";
        this._strokes = info;

        const pars = this._tee._pars;
        const stroke_allocation = this._stroke_allocation();
        const gross = this._strokes;

        const gross_adjusted = gross.map((strokes, hole) => {
            const double_bogey = pars[hole] + stroke_allocation[hole] + 2;
            return strokes > double_bogey ? double_bogey : strokes;
        });

        const stableford = gross_adjusted.map((strokes, hole) => {
           const contract = pars[hole] + stroke_allocation[hole];
           return contract - strokes + 2;
        });

        return {
            gross_adjusted : gross_adjusted,
            stableford : stableford,
            total_gross : gross.reduce((prev, current) => prev + current, 0),
            total_gross_adjusted : gross_adjusted.reduce((prev, current) => prev + current, 0),
            total_stableford : stableford.reduce((prev, current) => prev + current, 0)
        };
    }

}

class Player {


    name(name) {
        if (this._name) throw "immutable";
        this._name = name;
        return this;
    }

    man() {
        if (this._gender) throw "immutable";
        this._gender = 'm';
        return this;
    }

    lady() {
        if (this._gender) throw "immutable";
        this._gender = 'f';
        return this;
    }

    index(index) {
        if (this._index) throw "immutable";
        this._index = index;
        return this;
    }

    plays(tee) {
        return new Round().with(this).on(tee);
    }

}



const drohme_men_white = new Tee(9).slope(98).rating18(61.2).par9(31).man();
const drohme_men_blue = new Tee(9).slope(96).rating18(60).par9(31).man();
const tournette_american9_men_blue = new Tee(9).slope(123).rating18(69.2).par9(36).man()
    .pars(4,4,4,3,4,5,3,5,4)
    .stroke_indexes(3,17,1,15,5,11,9,13,7);


const tournette_american9_women_orange = new Tee(9).slope(112).rating18(63.8).par9(36).lady();
const tournette_orival_men_blue = new Tee(9).slope(55).rating9(23.4).par9(27).man();
const tournette_orival_women_blue = new Tee(9).slope(56).rating9(23.9).par9(27).man();


const remy = new Player().index(50).name("Remy").man();

const round = remy.plays(tournette_american9_men_blue);

console.log(round.strokes(6, 10, 7, 3, 7, 6, 4, 6, 8));
console.log(round.course_handicap());
console.log(round.stableford(25));
console.log(round.gross_adjusted(55));
