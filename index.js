
function round_number(number, decimals) {
    const multiplier = 10 ** decimals;
    return Math.round(number * multiplier) / multiplier;
}

class Tee {

    constructor(holes) {
        this._holes = holes;
    }

    get holes() {
        return this._holes;
    }

    set slope(slope) {
        if (this._slope)  throw "already initialized";
        this._slope = slope;
    }

    get slope() {
        return this._slope;
    }

    set rating9(rating9) {
        if (this._rating18)  throw "already initialized";
        this._rating18 = 2 * rating9;
    }

    get rating9() {
        return this._rating18 / 2.0;
    }

    set rating18(rating18) {
        if (this._rating18)  throw "immutable";
        this._rating18 = rating18;
    }

    get rating18() {
        return this._rating18;
    }

    set par9(par9) {
        if (this._par18)  throw "immutable";
        this._par18 = 2 * par9;
    }

    get par9() {
        return this._par18 / 2.0;
    }

    set par18(par18) {
        if (this._par18)  throw "immutable";
        this._par18 = par18;
    }

    set par(info) {
        if (info.length != this.holes) throw "incorrect length";
        this._par = info;
    }

    get par() {
        return this._par;
    }

    set stroke_index(info) {
        if (info.length != this.holes) throw "incorrect length";
        this._stroke_index = info;
    }

    get stroke_index() {
        return this._stroke_index;
    }

    get par18() {
        return this._par18;
    }

    course_handicap(player) {
        const course_handicap18 = player.index * this.slope / 113.0 + (this.rating18 - this.par18);
        return this.holes == 18 ? round_number(course_handicap18, 0) : round_number(course_handicap18 / 2.0, 0);
    }

}

class Round {

    constructor(player, tee) {
        this._player = player;
        this._tee = tee;
    }

    get player() {
        return this._player;
    }

    get tee() {
        return this._tee;
    }

    get course_handicap() {
        return this.tee.course_handicap(this.player);
    }

    _hole_multiplier() {
        return 18 / this.tee.holes;
    }

    _score_differential(played_course_handicap18) {
        const score_differential = round_number((played_course_handicap18 - (this.tee.rating18 - this.tee.par18)) * 113.0 / this.tee.slope, 1);
        return {
            course_handicap_played : played_course_handicap18 / this._hole_multiplier(),
            score_differential : score_differential
        }
    }

    stableford(score) {
        const score18 = this.tee.holes == 18 ? score : score + 17;
        const played_course_handicap18 = this.course_handicap * this._hole_multiplier() - (score18 - 36);
        return this._score_differential(played_course_handicap18);
    }

    gross_adjusted(score) {
        const score18 = this.tee.holes == 18 ? score : score + this.tee.par9 + this.course_handicap + 1;
        const played_course_handicap18 = score18 - this.tee.par18;
        return this._score_differential(played_course_handicap18);
    }

    strokes(...info) {
        if (info.length != this.tee.holes) throw "incorrect length";
        this._strokes = info;
    }

}

class Player {
    constructor(index) {
        this._index = index;
    }

    set index(index) {
        throw "immutable";
    }

    get index() {
        return this._index;
    }

    plays(tee) {
        return new Round(this, tee);
    }

}



const drohme_men_white = new Tee(9);
drohme_men_white.slope = 98;
drohme_men_white.rating18 = 61.2;
drohme_men_white.par9 = 31;

const drohme_men_blue = new Tee(9);
drohme_men_blue.slope = 96;
drohme_men_blue.rating18 = 60;
drohme_men_blue.par9 = 31;

const tournette_american9_men_blue = new Tee(9);
tournette_american9_men_blue.slope = 123;
tournette_american9_men_blue.rating18 = 69.2;
tournette_american9_men_blue.par9 = 36;
tournette_american9_men_blue.par = [4,4,4,3,4,5,3,5,4];
tournette_american9_men_blue.stroke_index = [3,17,1,15,5,11,9,13,7]

const tournette_american9_women_orange = new Tee(9);
tournette_american9_women_orange.slope = 112;
tournette_american9_women_orange.rating18 = 63.8;
tournette_american9_women_orange.par9 = 36;

const tournette_orival_men_blue = new Tee(9);
tournette_orival_men_blue.slope = 55;
tournette_orival_men_blue.rating9 = 23.4;
tournette_orival_men_blue.par9 = 27;

const tournette_orival_women_blue = new Tee(9);
tournette_orival_women_blue.slope = 56;
tournette_orival_women_blue.rating9 = 23.9;
tournette_orival_women_blue.par9 = 27;


const remy = new Player(36);
const ying = new Player(50);

const round = remy.plays(tournette_american9_men_blue);

console.log(round.strokes(6, 10, 7, 3, 7, 6, 4, 6, 8));
console.log(round.course_handicap);
console.log(round.stableford(25));
