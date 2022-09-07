
function round(number, decimals) {
    const multiplier = 10 ** decimals;
    return Math.round(number * multiplier) / multiplier;
}

class Tee {

    set slope(slope) {
        if (this._slope)  throw "already initialized";
        this._slope = slope;
    }

    get slope() {
        return this._slope;
    }

    set rating9(rating9) {
        if (this._rating)  throw "already initialized";
        this._rating = 2 * rating9;
    }

    get rating9() {
        return this._rating / 2.0;
    }

    set rating18(rating18) {
        if (this._rating)  throw "already initialized";
        this._rating = rating18;
    }

    get rating18() {
        return this._rating;
    }

    set par9(par9) {
        if (this._par)  throw "already initialized";
        this._par = 2 * par9;
    }

    get par9() {
        return this._par / 2.0;
    }

    set par18(par18) {
        if (this._par)  throw "already initialized";
        this._par = par18;
    }

    get par18() {
        return this._par;
    }


    course_handicap18(player) {
        return round(player.index * this.slope / 113.0 + (this.rating18 - this.par18), 0);
    }

    course_handicap9(player) {
        return round(this.course_handicap18(player) / 2.0, 0);
    }

}

class ScoreCard {

    constructor(player, tee, holes) {
        this._player = player;
        this._tee = tee;
        this._holes = holes;
    }

    get holes() {
        return this._holes;
    }

    get player() {
        return this._player;
    }

    get tee() {
        return this._tee;
    }

    get course_handicap() {
        return this._holes == 18 ? this.tee.course_handicap18(this.player) : this.tee.course_handicap9(this.player);
    }

    _score_differential(played_course_handicap18) {
        const score_differential = round((played_course_handicap18 - (this.tee.rating18 - this.tee.par18)) * 113.0 / this.tee.slope, 1);
        return {
            course_handicap_played : this.holes == 18 ? played_course_handicap18 : played_course_handicap18 / 2.0,
            score_differential : score_differential
        }
    }

    stableford(score) {
        const score18 = this.holes == 18 ? score : score + this.holes * 2 - 1;
        const played_course_handicap18 = this.tee.course_handicap18(this.player) - (score18 - 36);
        return this._score_differential(played_course_handicap18);
    }

    gross(score) {
        const score18 = this.holes == 18 ? score : score + this.tee.par9 + this.tee.course_handicap9(this.player) + 1;
        console.log(score18);
        const played_course_handicap18 = score18 - this.tee.par18;
        return this._score_differential(played_course_handicap18);
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

    plays9(tee) {
        return new ScoreCard(this, tee, 9);
    }

    plays18(tee) {
        return new ScoreCard(this, tee, 18);
    }
}



american_blue_tee = new Tee();
american_blue_tee.slope = 126;
american_blue_tee.rating9 = 36;
american_blue_tee.par18 = 70;

remy = new Player(14.2);
const score_card = remy.plays9(american_blue_tee);
console.log(score_card.gross(46));
console.log(score_card.stableford(16));
