from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Note, Food, Recipe, Ingredient
from . import db
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for


views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
@login_required
def home():
    if request.method == 'POST':
        note = request.form.get('note')#Gets the note from the HTML

        if len(note) < 1:
            flash('Note is too short!', category='error')
        else:
            new_note = Note(data=note, user_id=current_user.id)  #providing the schema for the note
            db.session.add(new_note) #adding the note to the database
            db.session.commit()
            flash('Note added!', category='success')

    return render_template("home.html", user=current_user)


@views.route('/delete-note', methods=['POST'])
def delete_note():
    note = json.loads(request.data) # this function expects a JSON from the INDEX.js file
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()

    return jsonify({})


@views.route("/pantry", methods=["GET", "POST"])
@login_required
def pantry():
    if request.method == "POST":
        name = request.form["name"]
        expirationDate = datetime.strptime(request.form["expirationDate"], "%Y-%m-%d").date()
        amount = request.form["amount"]
        unit = request.form["unit"]
        new_food = Food(name=name, expirationDate=expirationDate, amount=amount, unit=unit, user_id=current_user.id)
        db.session.add(new_food)
        db.session.commit()
        flash("Food added!", category="success")
    
    return render_template("pantry.html", user=current_user)


@views.route("/grocerylist", methods=["GET", "POST"])
@login_required
def grocerylist():
    return render_template("grocerylist.html", user=current_user)


#  most recent version of recipes: correctly submits and displays recipes
#  bugs: once u add a recipe, the delete function stops working, u have to refresh the page
@views.route("/recipes", methods=["GET", "POST"])
@login_required
def recipes():
    #pantry_items = Food.query.filter_by(user_id=current_user.id).all()
    if request.method == "POST":
        recipe_name = request.form["recipe_name"]
        ingredient_names = request.form.getlist("ingredient_name[]")
        ingredient_amounts = request.form.getlist("ingredient_amount[]")
        ingredient_units = request.form.getlist("ingredient_unit[]")

        ingredients = []
        for name, amount, unit in zip(ingredient_names, ingredient_amounts, ingredient_units):
            ingredient = Ingredient(name=name, amount=amount, unit=unit)
            ingredients.append(ingredient)

        new_recipe = Recipe(name=recipe_name, user_id=current_user.id, ingredients=ingredients)
        db.session.add(new_recipe)
        db.session.commit()
        flash("Recipe added!", category="success")

    return render_template("recipes.html", user=current_user)


@views.route('/delete-recipe', methods=['POST'])
def delete_recipe():
    recipe_data = json.loads(request.data)
    recipe_id = recipe_data['recipeId']
    recipe = Recipe.query.get(recipe_id)
    if recipe and recipe.user_id == current_user.id:
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe deleted successfully', 'recipeId': recipe_id})

    return jsonify({'message': 'Failed to delete recipe'})


@views.route('/delete-food', methods=['POST'])
def delete_food():
    food = json.loads(request.data)  # this function expects JSON from the INDEX.js file
    foodId = food['foodId']
    food = Food.query.get(foodId)
    if food:
        if food.user_id == current_user.id:
            db.session.delete(food)
            db.session.commit()
            return jsonify({'message': 'Food deleted successfully'})

    return jsonify({'message': 'Failed to delete food'})




