import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC

# Step 1: Get the data
data_url = "http://www.cs.csi.cuny.edu/∼chen/412/a2.csv.txt"
data = pd.read_csv(data_url)

# Step 2: Prepare the data
X = data.iloc[:, :-1]
y = data.iloc[:, -1]

# Step 3: Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=1000, random_state=42)

# Step 4: Choose models
models = {
    "Logistic Regression": LogisticRegression(),
    "Random Forest": RandomForestClassifier(),
    "Gradient Boosting": GradientBoostingClassifier(),
    # Add more models if desired
}

# Step 5: Fine-tune models using grid search
param_grid = {
    "Logistic Regression": {'C': [0.1, 1, 10]},
    "Random Forest": {'n_estimators': [100, 200, 300], 'max_depth': [None, 10, 20]},
    "Gradient Boosting": {'n_estimators': [100, 200, 300], 'learning_rate': [0.1, 0.05, 0.01]},
    # Add more parameters if desired
}

best_models = {}
for name, model in models.items():
    grid_search = GridSearchCV(model, param_grid[name], cv=5, scoring='accuracy')
    grid_search.fit(X_train, y_train)
    best_models[name] = grid_search.best_estimator_

# Step 6: Evaluate model performance using cross-validation
for name, model in best_models.items():
    scores = cross_val_score(model, X_train, y_train, cv=5)
    print(f"{name}: Cross-Validation Accuracy: {np.mean(scores)}")

# Step 7: Final testing
for name, model in best_models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"{name}:")
    print(confusion_matrix(y_test, y_pred))
    print(classification_report(y_test, y_pred))
